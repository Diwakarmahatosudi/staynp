import { NextRequest, NextResponse } from "next/server";
import { initializeKhaltiPayment, verifyKhaltiPayment } from "@/lib/khalti";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id, amount, property_name, customer } = body;

    if (!booking_id || !amount) {
      return NextResponse.json(
        { error: "Missing booking_id or amount" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const result = await initializeKhaltiPayment({
      returnUrl: `${appUrl}/api/payment/khalti?action=verify&booking_id=${booking_id}`,
      websiteUrl: appUrl,
      amount: amount * 100, // Convert NPR to paisa
      purchaseOrderId: booking_id,
      purchaseOrderName: property_name || "StayNP Booking",
      customerInfo: customer,
    });

    return NextResponse.json({
      payment_url: result.payment_url,
      pidx: result.pidx,
    });
  } catch (error) {
    console.error("Khalti payment init error:", error);
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
  const pidx = searchParams.get("pidx");

  if (action === "verify" && pidx) {
    try {
      const result = await verifyKhaltiPayment(pidx);

      if (result.status === "Completed") {
        // In production: update booking in Supabase
        // await supabase.from('bookings').update({ status: 'confirmed', payment_id: result.transaction_id }).eq('id', bookingId);

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        return NextResponse.redirect(`${appUrl}/booking/${bookingId}?payment=success`);
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      return NextResponse.redirect(`${appUrl}/booking/${bookingId}?payment=failed`);
    } catch (error) {
      console.error("Khalti verification error:", error);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      return NextResponse.redirect(`${appUrl}/booking/${bookingId}?payment=failed`);
    }
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
