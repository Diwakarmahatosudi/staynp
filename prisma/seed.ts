import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Load .env (and .env.local if present) for stand-alone script runs
for (const f of [".env", ".env.local"]) {
  const p = path.resolve(process.cwd(), f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (!m) continue;
    const [, k, raw] = m;
    if (process.env[k]) continue;
    process.env[k] = raw.replace(/^["'](.*)["']$/, "$1");
  }
}

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding StayNP database...");

  const passwordHash = await bcrypt.hash("Password123", 12);

  // Hosts
  const sita = await prisma.user.upsert({
    where: { email: "sita@example.com" },
    update: {},
    create: {
      fullName: "Sita Sharma",
      email: "sita@example.com",
      phone: "9841234567",
      passwordHash,
      isHost: true,
      isVerified: true,
      emailVerified: true,
      phoneVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    },
  });

  const ram = await prisma.user.upsert({
    where: { email: "ram@example.com" },
    update: {},
    create: {
      fullName: "Ram Bahadur Thapa",
      email: "ram@example.com",
      phone: "9851234567",
      passwordHash,
      isHost: true,
      isVerified: true,
      emailVerified: true,
      phoneVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
  });

  // Demo guest
  await prisma.user.upsert({
    where: { email: "guest@example.com" },
    update: {},
    create: {
      fullName: "Alex Johnson",
      email: "guest@example.com",
      phone: "9801234567",
      passwordHash,
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const properties = [
    {
      host: sita.id,
      title: "Heritage Homestay in Bhaktapur Durbar Square",
      description: "A beautifully restored 200-year-old Newari home steps from the iconic Bhaktapur Durbar Square.",
      propertyType: "heritage-stay",
      pricePerNight: 3500,
      district: "Bhaktapur",
      region: "Kathmandu Valley",
      address: "Taumadhi Square, Bhaktapur",
      beds: 2, bedrooms: 1, bathrooms: 1, maxGuests: 3,
      amenities: ["wifi", "hot-water", "breakfast", "traditional-decor", "rooftop-terrace"],
      mainImageUrl: "https://images.unsplash.com/photo-1558799401-1dcba79834c2?w=1200",
      images: [
        "https://images.unsplash.com/photo-1558799401-1dcba79834c2?w=1200",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200",
      ],
    },
    {
      host: ram.id,
      title: "Lakeside Lodge with Annapurna Views — Pokhara",
      description: "Wake up to a view of the Annapurna massif reflecting in Phewa Lake. Private balcony, local cuisine.",
      propertyType: "lodge",
      pricePerNight: 4200,
      district: "Kaski",
      region: "Pokhara & Annapurna",
      address: "Lakeside, Pokhara",
      beds: 3, bedrooms: 2, bathrooms: 2, maxGuests: 4,
      amenities: ["wifi", "mountain-view", "balcony", "breakfast", "airport-pickup"],
      mainImageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200",
      images: [
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
      ],
    },
    {
      host: sita.id,
      title: "Himalayan Mountain Retreat — Namche Bazaar",
      description: "Cozy stone-and-timber lodge at 3,440m with panoramic views of Everest and Ama Dablam.",
      propertyType: "mountain-retreat",
      pricePerNight: 6000,
      district: "Solukhumbu",
      region: "Everest Region",
      address: "Namche Bazaar",
      beds: 2, bedrooms: 1, bathrooms: 1, maxGuests: 2,
      amenities: ["hot-water", "heater", "mountain-view", "trekking-guide", "fireplace"],
      mainImageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200",
      images: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200"],
    },
  ];

  for (const p of properties) {
    await prisma.property.upsert({
      where: { id: `seed-${p.title.slice(0, 10).replace(/\s/g, "-")}` },
      update: {},
      create: {
        id: `seed-${p.title.slice(0, 10).replace(/\s/g, "-")}`,
        title: p.title,
        description: p.description,
        propertyType: p.propertyType,
        pricePerNight: p.pricePerNight,
        district: p.district,
        region: p.region,
        address: p.address,
        beds: p.beds, bedrooms: p.bedrooms, bathrooms: p.bathrooms, maxGuests: p.maxGuests,
        amenities: JSON.stringify(p.amenities),
        mainImageUrl: p.mainImageUrl,
        images: JSON.stringify(p.images),
        hostId: p.host,
        isActive: true,
        isVerified: true,
      },
    });
  }

  console.log("✅ Seed complete.");
  console.log("   Demo host:  sita@example.com / Password123   (phone 9841234567)");
  console.log("   Demo guest: guest@example.com / Password123  (phone 9801234567)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
