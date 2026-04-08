import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      property_id,
      guest_id,
      check_in,
      check_out,
      guests_count,
      payment_method,
      guest_phone,
    } = body;

    if (!property_id || !check_in || !check_out) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // In production: use Supabase to create booking
    // const supabase = await createServerSupabaseClient();
    //
    // 1. Check for booking conflicts
    // const { data: conflicts } = await supabase
    //   .from('bookings')
    //   .select('id')
    //   .eq('property_id', property_id)
    //   .neq('status', 'cancelled')
    //   .or(`and(check_in.lte.${check_out},check_out.gte.${check_in})`);
    //
    // if (conflicts && conflicts.length > 0) {
    //   return NextResponse.json({ error: "Dates not available" }, { status: 409 });
    // }
    //
    // 2. Create the booking
    // const { data: booking, error } = await supabase
    //   .from('bookings')
    //   .insert({ property_id, guest_id, check_in, check_out, guests_count, payment_method, status: 'pending' })
    //   .select()
    //   .single();
    //
    // 3. Send SMS confirmation
    // await sendSMS({ to: guest_phone, message: formatBookingConfirmationSMS(...) });

    const mockBooking = {
      id: `booking-${Date.now()}`,
      property_id,
      guest_id,
      check_in,
      check_out,
      guests_count,
      payment_method,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ booking: mockBooking }, { status: 201 });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("property_id");
  const guestId = searchParams.get("guest_id");

  // In production: query Supabase for bookings
  // const supabase = await createServerSupabaseClient();
  // let query = supabase.from('bookings').select('*, property:properties(*), guest:profiles(*)');
  // if (propertyId) query = query.eq('property_id', propertyId);
  // if (guestId) query = query.eq('guest_id', guestId);

  return NextResponse.json({ bookings: [] });
}
