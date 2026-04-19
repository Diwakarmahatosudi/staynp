import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth";
import { publicProperty } from "@/lib/user-dto";

const createSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().max(5000).optional().default(""),
  property_type: z.string().min(2),
  price_per_night: z.number().int().positive(),
  location_lat: z.number().optional(),
  location_lng: z.number().optional(),
  address: z.string().optional().default(""),
  district: z.string().min(2),
  region: z.string().optional().default(""),
  beds: z.number().int().nonnegative().default(1),
  bedrooms: z.number().int().nonnegative().default(1),
  bathrooms: z.number().int().nonnegative().default(1),
  max_guests: z.number().int().positive().default(2),
  amenities: z.array(z.string()).default([]),
  main_image_url: z.string().url().optional().or(z.literal("")).default(""),
  images: z.array(z.string().url()).default([]),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hostId = searchParams.get("host_id");
  const district = searchParams.get("district");
  const type = searchParams.get("type");
  const minPrice = Number(searchParams.get("min_price") || "0");
  const maxPrice = Number(searchParams.get("max_price") || "0");
  const q = searchParams.get("q")?.trim();
  const limit = Math.min(Number(searchParams.get("limit") || "50"), 100);
  const offset = Math.max(Number(searchParams.get("offset") || "0"), 0);

  const where: Record<string, unknown> = { isActive: true };
  if (hostId) where.hostId = hostId;
  if (district) where.district = district;
  if (type) where.propertyType = type;
  if (minPrice || maxPrice) {
    where.pricePerNight = {
      ...(minPrice ? { gte: minPrice } : {}),
      ...(maxPrice ? { lte: maxPrice } : {}),
    };
  }
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { district: { contains: q } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: { host: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.property.count({ where }),
  ]);

  return NextResponse.json({
    properties: items.map(publicProperty),
    total,
    limit,
    offset,
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const d = parsed.data;

    const property = await prisma.property.create({
      data: {
        title: d.title,
        description: d.description,
        propertyType: d.property_type,
        pricePerNight: d.price_per_night,
        locationLat: d.location_lat,
        locationLng: d.location_lng,
        address: d.address,
        district: d.district,
        region: d.region,
        beds: d.beds,
        bedrooms: d.bedrooms,
        bathrooms: d.bathrooms,
        maxGuests: d.max_guests,
        amenities: JSON.stringify(d.amenities),
        mainImageUrl: d.main_image_url || null,
        images: JSON.stringify(d.images),
        hostId: user.id,
      },
      include: { host: true },
    });

    // Ensure host flag is set
    if (!user.isHost) {
      await prisma.user.update({ where: { id: user.id }, data: { isHost: true } });
    }

    return NextResponse.json({ property: publicProperty(property) }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("create property error:", err);
    return NextResponse.json({ error: "Could not create property" }, { status: 500 });
  }
}
