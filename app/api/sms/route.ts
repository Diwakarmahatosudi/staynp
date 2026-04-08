import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/sms";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: "Missing 'to' or 'message' field" },
        { status: 400 }
      );
    }

    const success = await sendSMS({ to, message });

    if (success) {
      return NextResponse.json({ success: true, message: "SMS sent" });
    }

    return NextResponse.json(
      { success: false, message: "SMS failed — check Aakash SMS token" },
      { status: 500 }
    );
  } catch (error) {
    console.error("SMS API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
