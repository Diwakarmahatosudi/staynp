import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth";
import { publicBooking } from "@/lib/user-dto";
import { sendEmail, bookingConfirmationEmail } from "@/lib/email";
import { sendSMS, formatBookingConfirmationSMS } from "@/lib/sms";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteCtx) {
  try {
    const { id } = await params;
    const user = await requireUser();
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { property: { include: { host: true } }, guest: true },
    });
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isGuest = booking.guestId === user.id;
    const isHost = booking.property.hostId === user.id;
    if (!isGuest && !isHost) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json({
      booking: {
        ...publicBooking(booking),
        property: {
          id: booking.property.id,
          title: booking.property.title,
          district: booking.property.district,
          main_image_url: booking.property.mainImageUrl ?? "",
          price_per_night: booking.property.pricePerNight,
          host: {
            id: booking.property.host.id,
            full_name: booking.property.host.fullName,
            phone: booking.property.host.phone,
          },
        },
        guest: {
          id: booking.guest.id,
          full_name: booking.guest.fullName,
          phone: booking.guest.phone,
          email: booking.guest.email,
        },
      },
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("get booking error:", err);
    return NextResponse.json({ error: "Could not load booking" }, { status: 500 });
  }
}

const patchSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: RouteCtx) {
  try {
    const { id } = await params;
    const user = await requireUser();
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { property: { include: { host: true } }, guest: true },
    });
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isGuest = booking.guestId === user.id;
    const isHost = booking.property.hostId === user.id;
    if (!isGuest && !isHost) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    // Guests can only cancel; hosts can confirm/cancel/complete
    if (parsed.data.status) {
      if (isGuest && !isHost && parsed.data.status !== "cancelled") {
        return NextResponse.json({ error: "Guests can only cancel" }, { status: 403 });
      }
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(parsed.data.status && { status: parsed.data.status }),
      },
    });

    // On confirmation, notify guest
    if (parsed.data.status === "confirmed") {
      if (booking.guest.phone) {
        await sendSMS({
          to: booking.guest.phone,
          message: formatBookingConfirmationSMS(
            booking.guest.fullName,
            booking.property.title,
            booking.checkIn.toISOString().slice(0, 10),
            booking.checkOut.toISOString().slice(0, 10)
          ),
        }).catch(() => {});
      }
      if (booking.guest.email) {
        const tpl = bookingConfirmationEmail({
          guestName: booking.guest.fullName,
          propertyTitle: booking.property.title,
          checkIn: booking.checkIn.toISOString().slice(0, 10),
          checkOut: booking.checkOut.toISOString().slice(0, 10),
          totalPrice: booking.totalPrice,
          bookingId: booking.id,
        });
        await sendEmail({ to: booking.guest.email, subject: "Your StayNP booking is confirmed", ...tpl }).catch(() => {});
      }
    }

    return NextResponse.json({ booking: publicBooking(updated) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("patch booking error:", err);
    return NextResponse.json({ error: "Could not update booking" }, { status: 500 });
  }
}
