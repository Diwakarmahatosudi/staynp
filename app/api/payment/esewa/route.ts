import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createEsewaPaymentPayload, verifyEsewaPayment } from "@/lib/esewa";
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
      include: { property: true },
    });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (booking.guestId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (booking.paymentStatus === "paid") {
      return NextResponse.json({ error: "Booking already paid" }, { status: 409 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const transactionUuid = randomUUID();

    const payload = createEsewaPaymentPayload({
      amount: booking.totalPrice,
      productCode: process.env.ESEWA_MERCHANT_CODE || "EPAYTEST",
      transactionUuid,
      successUrl: `${appUrl}/api/payment/esewa?action=verify&booking_id=${booking.id}`,
      failureUrl: `${appUrl}/booking/${booking.id}?payment=failed`,
    });

    // Record the payment attempt
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        provider: "esewa",
        amount: booking.totalPrice,
        providerRef: transactionUuid,
        status: "initiated",
        rawRequest: JSON.stringify(payload),
      },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentMethod: "esewa", paymentStatus: "initiated", paymentId: transactionUuid },
    });

    const paymentUrl = process.env.NEXT_PUBLIC_ESEWA_PAYMENT_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    return NextResponse.json({
      payment_url: paymentUrl,
      payload,
      transaction_uuid: transactionUuid,
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("eSewa init error:", err);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const bookingId = searchParams.get("booking_id");
  const data = searchParams.get("data");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (action !== "verify" || !data || !bookingId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await verifyEsewaPayment(data);
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { property: true, guest: true } });
  if (!booking) return NextResponse.redirect(`${appUrl}/`);

  if (result.success && result.data) {
    await prisma.payment.updateMany({
      where: { bookingId: booking.id, providerRef: result.data.transaction_uuid },
      data: { status: "success", rawResponse: JSON.stringify(result.data) },
    });
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: "paid",
        status: "confirmed",
        paymentId: result.data.transaction_uuid,
      },
    });

    // Notify guest
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
    where: { bookingId: booking.id, status: "initiated" },
    data: { status: "failed" },
  });
  await prisma.booking.update({ where: { id: booking.id }, data: { paymentStatus: "failed" } });

  return NextResponse.redirect(`${appUrl}/booking/${bookingId}?payment=failed`);
}
