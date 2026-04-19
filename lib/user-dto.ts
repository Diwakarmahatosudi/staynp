import type { User } from "@prisma/client";

export function publicUser(u: Pick<
  User,
  | "id"
  | "fullName"
  | "email"
  | "phone"
  | "avatarUrl"
  | "isHost"
  | "isVerified"
  | "emailVerified"
  | "phoneVerified"
  | "kycStatus"
  | "createdAt"
>) {
  return {
    id: u.id,
    full_name: u.fullName,
    email: u.email,
    phone: u.phone,
    avatar_url: u.avatarUrl,
    is_host: u.isHost,
    is_verified: u.isVerified,
    email_verified: u.emailVerified,
    phone_verified: u.phoneVerified,
    kyc_status: u.kycStatus,
    created_at: u.createdAt.toISOString(),
  };
}

export function publicProperty(p: {
  id: string;
  title: string;
  description: string | null;
  propertyType: string;
  pricePerNight: number;
  locationLat: number | null;
  locationLng: number | null;
  address: string | null;
  district: string;
  region: string | null;
  beds: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string;
  mainImageUrl: string | null;
  images: string;
  hostId: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  host?: User | null;
}) {
  return {
    id: p.id,
    title: p.title,
    description: p.description ?? "",
    property_type: p.propertyType,
    price_per_night: p.pricePerNight,
    location_lat: p.locationLat ?? 0,
    location_lng: p.locationLng ?? 0,
    address: p.address ?? "",
    district: p.district,
    region: p.region ?? "",
    beds: p.beds,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    max_guests: p.maxGuests,
    amenities: safeJson<string[]>(p.amenities, []),
    main_image_url: p.mainImageUrl ?? "",
    images: safeJson<string[]>(p.images, []),
    host_id: p.hostId,
    host: p.host ? publicUser(p.host) : undefined,
    is_active: p.isActive,
    is_verified: p.isVerified,
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt.toISOString(),
  };
}

export function publicBooking(b: {
  id: string;
  propertyId: string;
  guestId: string;
  checkIn: Date;
  checkOut: Date;
  guestsCount: number;
  totalPrice: number;
  status: string;
  paymentMethod: string | null;
  paymentId: string | null;
  paymentStatus: string;
  guestPhone: string | null;
  guestEmail: string | null;
  createdAt: Date;
}) {
  return {
    id: b.id,
    property_id: b.propertyId,
    guest_id: b.guestId,
    check_in: b.checkIn.toISOString().slice(0, 10),
    check_out: b.checkOut.toISOString().slice(0, 10),
    guests_count: b.guestsCount,
    total_price: b.totalPrice,
    status: b.status,
    payment_method: b.paymentMethod,
    payment_id: b.paymentId,
    payment_status: b.paymentStatus,
    guest_phone: b.guestPhone,
    guest_email: b.guestEmail,
    created_at: b.createdAt.toISOString(),
  };
}

function safeJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
