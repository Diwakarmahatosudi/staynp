import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth";
import { publicBooking } from "@/lib/user-dto";
import { sendEmail, bookingConfirmationEmail } from "@/lib/email";
import { sendSMS, formatBookingNotificationToHost } from "@/lib/sms";

const createSchema = z.object({
  property_id: z.string().min(1),
  check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  guests_count: z.number().int().positive().max(50).default(1),
  payment_method: z.enum(["esewa", "khalti", "card", "bank_transfer"]).optional(),
  guest_phone: z.string().optional(),
  guest_email: z.string().email().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const asHost = searchParams.get("role") === "host";
    const status = searchParams.get("status");

    const where: Record<string, unknown> = asHost
      ? { property: { hostId: user.id } }
      : { guestId: user.id };
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: { property: true, guest: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      bookings: bookings.map((b) => ({
        ...publicBooking(b),
        property: {
          id: b.property.id,
          title: b.property.title,
          district: b.property.district,
          main_image_url: b.property.mainImageUrl ?? "",
          price_per_night: b.property.pricePerNight,
        },
        guest: {
          id: b.guest.id,
          full_name: b.guest.fullName,
          phone: b.guest.phone,
          email: b.guest.email,
        },
      })),
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("list bookings error:", err);
    return NextResponse.json({ error: "Could not load bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const d = parsed.data;

    const checkIn = new Date(d.check_in);
    const checkOut = new Date(d.check_out);
    if (checkOut <= checkIn) return NextResponse.json({ error: "Check-out must be after check-in" }, { status: 400 });

    const property = await prisma.property.findUnique({ where: { id: d.property_id }, include: { host: true } });
    if (!property || !property.isActive) return NextResponse.json({ error: "Property not available" }, { status: 404 });
    if (property.hostId === user.id) return NextResponse.json({ error: "You cannot book your own listing" }, { status: 400 });
    if (d.guests_count > property.maxGuests) {
      return NextResponse.json({ error: `Max ${property.maxGuests} guests for this property` }, { status: 400 });
    }

    // Conflict check
    const conflict = await prisma.booking.findFirst({
      where: {
        propertyId: property.id,
        status: { not: "cancelled" },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
    });
    if (conflict) return NextResponse.json({ error: "Those dates are already booked" }, { status: 409 });

    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (24 * 60 * 60 * 1000)));
    const subtotal = nights * property.pricePerNight;
    const serviceFee = Math.round(subtotal * 0.05);
    const totalPrice = subtotal + serviceFee;

    const booking = await prisma.booking.create({
      data: {
        propertyId: property.id,
        guestId: user.id,
        checkIn,
        checkOut,
        guestsCount: d.guests_count,
        totalPrice,
        paymentMethod: d.payment_method,
        guestPhone: d.guest_phone ?? user.phone,
        guestEmail: d.guest_email ?? user.email,
      },
    });

    // Notify host via SMS if we have their phone
    if (property.host.phone) {
      await sendSMS({
        to: property.host.phone,
        message: formatBookingNotificationToHost(
          property.host.fullName,
          user.fullName,
          property.title,
          checkIn.toISOString().slice(0, 10),
          checkOut.toISOString().slice(0, 10)
        ),
      }).catch(() => {});
    }

    // Email the guest a pending-booking acknowledgement
    if (user.email) {
      const tpl = bookingConfirmationEmail({
        guestName: user.fullName,
        propertyTitle: property.title,
        checkIn: checkIn.toISOString().slice(0, 10),
        checkOut: checkOut.toISOString().slice(0, 10),
        totalPrice,
        bookingId: booking.id,
      });
      await sendEmail({ to: user.email, subject: "Your StayNP booking (pending payment)", ...tpl }).catch(() => {});
    }

    return NextResponse.json({
      booking: {
        ...publicBooking(booking),
        nights,
        subtotal,
        service_fee: serviceFee,
      },
    }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("create booking error:", err);
    return NextResponse.json({ error: "Could not create booking" }, { status: 500 });
  }
}
