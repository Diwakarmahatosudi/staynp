import { NextRequest, NextResponse } from "next/server";
import { initializeKhaltiPayment, verifyKhaltiPayment } from "@/lib/khalti";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth";
import { sendEmail, bookingConfirmationEmail } from "@/lib/email";
import { sendSMS, formatBookingConfirmationSMS } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { booking_id } = body ?? {};
    if (!booking_id) return NextResponse.json({ error: "Missing booking_id" }, { status: 400 });

    const booking = await prisma.booking.findUnique({
      where: { id: booking_id },
      include: { property: true, guest: true },
    });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (booking.guestId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (booking.paymentStatus === "paid") {
      return NextResponse.json({ error: "Booking already paid" }, { status: 409 });
    }

    if (!process.env.KHALTI_SECRET_KEY) {
      return NextResponse.json({ error: "Khalti is not configured on the server" }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const result = await initializeKhaltiPayment({
      returnUrl: `${appUrl}/api/payment/khalti?action=verify&booking_id=${booking.id}`,
      websiteUrl: appUrl,
      amount: booking.totalPrice * 100, // NPR → paisa
      purchaseOrderId: booking.id,
      purchaseOrderName: booking.property.title,
      customerInfo: {
        name: booking.guest.fullName,
        email: booking.guest.email ?? undefined,
        phone: booking.guest.phone ?? undefined,
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        provider: "khalti",
        amount: booking.totalPrice,
        providerRef: result.pidx,
        status: "initiated",
        rawResponse: JSON.stringify(result),
      },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentMethod: "khalti", paymentStatus: "initiated", paymentId: result.pidx },
    });

    return NextResponse.json({ payment_url: result.payment_url, pidx: result.pidx });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("Khalti init error:", err);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const bookingId = searchParams.get("booking_id");
  const pidx = searchParams.get("pidx");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (action !== "verify" || !pidx || !bookingId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const result = await verifyKhaltiPayment(pidx);
    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { property: true, guest: true } });
    if (!booking) return NextResponse.redirect(`${appUrl}/`);

    if (result.status === "Completed" && result.total_amount === booking.totalPrice * 100) {
      await prisma.payment.updateMany({
        where: { bookingId: booking.id, providerRef: pidx },
        data: { status: "success", rawResponse: JSON.stringify(result) },
      });
      await prisma.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: "paid", status: "confirmed", paymentId: result.transaction_id },
      });

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
        await sendEmail({ to: booking.guest.email, subject: "StayNP booking confirmed ✓", ...tpl }).catch(() => {});
      }

      return NextResponse.redirect(`${appUrl}/booking/${bookingId}?payment=success`);
    }

    await prisma.payment.updateMany({
      where: { bookingId: booking.id, providerRef: pidx },
      data: { status: "failed", rawResponse: JSON.stringify(result) },
    });
    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentStatus: "failed" },
    });

    return NextResponse.redirect(`${appUrl}/booking/${bookingId}?payment=failed`);
  } catch (err) {
    console.error("Khalti verify error:", err);
    return NextResponse.redirect(`${appUrl}/booking/${bookingId}?payment=failed`);
  }
}
