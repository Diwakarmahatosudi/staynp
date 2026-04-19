import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth";

const createSchema = z.object({
  property_id: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().default(""),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("property_id");
  if (!propertyId) return NextResponse.json({ error: "property_id required" }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { propertyId },
    include: { guest: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    reviews: reviews.map((r) => ({
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

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { property_id, rating, comment } = parsed.data;

    // Guest must have stayed at the property (a completed or confirmed booking)
    const stayed = await prisma.booking.findFirst({
      where: {
        guestId: user.id,
        propertyId: property_id,
        status: { in: ["confirmed", "completed"] },
      },
    });
    if (!stayed) {
      return NextResponse.json(
        { error: "You can only review properties you've booked" },
        { status: 403 }
      );
    }

    const review = await prisma.review.upsert({
      where: { propertyId_guestId: { propertyId: property_id, guestId: user.id } },
      create: { propertyId: property_id, guestId: user.id, rating, comment },
      update: { rating, comment },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("review error:", err);
    return NextResponse.json({ error: "Could not save review" }, { status: 500 });
  }
}
