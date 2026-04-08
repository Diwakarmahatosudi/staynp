import { NextRequest, NextResponse } from "next/server";
import { createEsewaPaymentPayload, verifyEsewaPayment } from "@/lib/esewa";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id, amount } = body;

    if (!booking_id || !amount) {
      return NextResponse.json(
        { error: "Missing booking_id or amount" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const transactionUuid = randomUUID();

    const payload = createEsewaPaymentPayload({
      amount,
      productCode: process.env.ESEWA_MERCHANT_CODE || "EPAYTEST",
      transactionUuid,
      successUrl: `${appUrl}/api/payment/esewa?action=verify&booking_id=${booking_id}`,
      failureUrl: `${appUrl}/booking/${booking_id}?payment=failed`,
    });

    const paymentUrl = process.env.NEXT_PUBLIC_ESEWA_PAYMENT_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    return NextResponse.json({
      payment_url: paymentUrl,
      payload,
      transaction_uuid: transactionUuid,
    });
  } catch (error) {
    console.error("eSewa payment init error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const bookingId = searchParams.get("booking_id");
  const data = searchParams.get("data");

  if (action === "verify" && data) {
    const result = await verifyEsewaPayment(data);

    if (result.success) {
      // In production: update booking status to 'confirmed' in Supabase
      // const supabase = await createServerSupabaseClient();
      // await supabase.from('bookings').update({ status: 'confirmed', payment_id: result.data?.transaction_uuid }).eq('id', bookingId);

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      return NextResponse.redirect(`${appUrl}/booking/${bookingId}?payment=success`);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/booking/${bookingId}?payment=failed`);
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
