import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth";
import { publicProperty } from "@/lib/user-dto";

const updateSchema = z.object({
  title: z.string().min(3).max(140).optional(),
  description: z.string().max(5000).optional(),
  property_type: z.string().min(2).optional(),
  price_per_night: z.number().int().positive().optional(),
  location_lat: z.number().optional(),
  location_lng: z.number().optional(),
  address: z.string().optional(),
  district: z.string().optional(),
  region: z.string().optional(),
  beds: z.number().int().nonnegative().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  max_guests: z.number().int().positive().optional(),
  amenities: z.array(z.string()).optional(),
  main_image_url: z.string().url().optional().or(z.literal("")),
  images: z.array(z.string().url()).optional(),
  is_active: z.boolean().optional(),
});

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteCtx) {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    include: { host: true, reviews: { include: { guest: true } } },
  });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ratings = property.reviews.map((r) => r.rating);
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  return NextResponse.json({
    property: {
      ...publicProperty(property),
      average_rating: Number(avg.toFixed(2)),
      total_reviews: ratings.length,
    },
    reviews: property.reviews.map((r) => ({
      id: r.id,
      property_id: r.propertyId,
      guest_id: r.guestId,
      guest: { id: r.guest.id, full_name: r.guest.fullName, avatar_url: r.guest.avatarUrl },
      rating: r.rating,
      comment: r.comment ?? "",
      created_at: r.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(req: NextRequest, { params }: RouteCtx) {
  try {
    const { id } = await params;
    const user = await requireUser();
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.hostId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const d = parsed.data;

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...(d.title !== undefined && { title: d.title }),
        ...(d.description !== undefined && { description: d.description }),
        ...(d.property_type !== undefined && { propertyType: d.property_type }),
        ...(d.price_per_night !== undefined && { pricePerNight: d.price_per_night }),
        ...(d.location_lat !== undefined && { locationLat: d.location_lat }),
        ...(d.location_lng !== undefined && { locationLng: d.location_lng }),
        ...(d.address !== undefined && { address: d.address }),
        ...(d.district !== undefined && { district: d.district }),
        ...(d.region !== undefined && { region: d.region }),
        ...(d.beds !== undefined && { beds: d.beds }),
        ...(d.bedrooms !== undefined && { bedrooms: d.bedrooms }),
        ...(d.bathrooms !== undefined && { bathrooms: d.bathrooms }),
        ...(d.max_guests !== undefined && { maxGuests: d.max_guests }),
        ...(d.amenities !== undefined && { amenities: JSON.stringify(d.amenities) }),
        ...(d.main_image_url !== undefined && { mainImageUrl: d.main_image_url || null }),
        ...(d.images !== undefined && { images: JSON.stringify(d.images) }),
        ...(d.is_active !== undefined && { isActive: d.is_active }),
      },
      include: { host: true },
    });

    return NextResponse.json({ property: publicProperty(property) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("update property error:", err);
    return NextResponse.json({ error: "Could not update property" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteCtx) {
  try {
    const { id } = await params;
    const user = await requireUser();
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.hostId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.property.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("delete property error:", err);
    return NextResponse.json({ error: "Could not delete property" }, { status: 500 });
  }
}
