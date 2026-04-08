export interface Property {
  id: string;
  title: string;
  description: string;
  property_type: PropertyType;
  price_per_night: number;
  location_lat: number;
  location_lng: number;
  address: string;
  district: string;
  region: string;
  beds: number;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  amenities: string[];
  main_image_url: string;
  images: string[];
  host_id: string;
  host?: Profile;
  is_active: boolean;
  is_verified: boolean;
  average_rating?: number;
  total_reviews?: number;
  created_at: string;
  updated_at: string;
}

export type PropertyType =
  | "house"
  | "apartment"
  | "homestay"
  | "hotel"
  | "lodge"
  | "villa"
  | "cottage"
  | "heritage"
  | "guest-house"
  | "boutique-hotel"
  | "heritage-stay"
  | "mountain-retreat";

export const PROPERTY_TYPES: { value: PropertyType; label: string; nepali: string }[] = [
  { value: "homestay", label: "Homestay", nepali: "गृहवास" },
  { value: "lodge", label: "Lodge", nepali: "लज" },
  { value: "guest-house", label: "Guest House", nepali: "अतिथि गृह" },
  { value: "boutique-hotel", label: "Boutique Hotel", nepali: "बुटिक होटल" },
  { value: "heritage-stay", label: "Heritage Stay", nepali: "विरासत बास" },
  { value: "mountain-retreat", label: "Mountain Retreat", nepali: "हिमाल विश्राम" },
  { value: "house", label: "House", nepali: "घर" },
  { value: "apartment", label: "Apartment", nepali: "अपार्टमेन्ट" },
  { value: "hotel", label: "Hotel", nepali: "होटल" },
  { value: "villa", label: "Villa", nepali: "भिला" },
  { value: "cottage", label: "Cottage", nepali: "कुटी" },
  { value: "heritage", label: "Heritage", nepali: "विरासत" },
];

export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  avatar_url?: string;
  is_host: boolean;
  is_verified: boolean;
  kyc_document_url?: string;
  created_at: string;
}

export interface Booking {
  id: string;
  property_id: string;
  property?: Property;
  guest_id: string;
  guest?: Profile;
  check_in: string;
  check_out: string;
  total_price: number;
  guests_count: number;
  status: BookingStatus;
  payment_method?: PaymentMethod;
  payment_id?: string;
  created_at: string;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type PaymentMethod = "esewa" | "khalti" | "card" | "bank_transfer";

export interface Review {
  id: string;
  property_id: string;
  guest_id: string;
  guest?: Profile;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Region {
  id: string;
  name: string;
  nepali_name: string;
  description: string;
  image_url: string;
  property_count: number;
}

export const NEPAL_REGIONS: Region[] = [
  {
    id: "kathmandu-valley",
    name: "Kathmandu Valley",
    nepali_name: "काठमाडौं उपत्यका",
    description: "Ancient temples, vibrant streets, and cultural heritage",
    image_url: "https://images.unsplash.com/photo-1558799401-1dcba79834c2?w=800",
    property_count: 245,
  },
  {
    id: "pokhara",
    name: "Pokhara & Annapurna",
    nepali_name: "पोखरा र अन्नपूर्ण",
    description: "Lakeside serenity with stunning mountain views",
    image_url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
    property_count: 189,
  },
  {
    id: "chitwan",
    name: "Chitwan & Terai",
    nepali_name: "चितवन र तराई",
    description: "Wildlife adventures and warm plains hospitality",
    image_url: "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800",
    property_count: 87,
  },
  {
    id: "everest",
    name: "Everest Region",
    nepali_name: "एभरेस्ट क्षेत्र",
    description: "Gateway to the roof of the world",
    image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    property_count: 56,
  },
  {
    id: "lumbini",
    name: "Lumbini",
    nepali_name: "लुम्बिनी",
    description: "Birthplace of Buddha, a pilgrimage of peace",
    image_url: "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800",
    property_count: 34,
  },
  {
    id: "mustang",
    name: "Mustang & Manang",
    nepali_name: "मुस्ताङ र मनाङ",
    description: "Hidden Himalayan valleys and ancient kingdoms",
    image_url: "https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=800",
    property_count: 28,
  },
];

export const NEPAL_DISTRICTS: { id: string; name: string }[] = [
  { id: "kathmandu", name: "Kathmandu" },
  { id: "lalitpur", name: "Lalitpur" },
  { id: "bhaktapur", name: "Bhaktapur" },
  { id: "kaski", name: "Kaski" },
  { id: "chitwan", name: "Chitwan" },
  { id: "solukhumbu", name: "Solukhumbu" },
  { id: "rupandehi", name: "Rupandehi" },
  { id: "mustang", name: "Mustang" },
  { id: "manang", name: "Manang" },
  { id: "gorkha", name: "Gorkha" },
  { id: "rasuwa", name: "Rasuwa" },
  { id: "sindhupalchok", name: "Sindhupalchok" },
  { id: "dolakha", name: "Dolakha" },
  { id: "ilam", name: "Ilam" },
  { id: "jhapa", name: "Jhapa" },
  { id: "morang", name: "Morang" },
  { id: "sunsari", name: "Sunsari" },
  { id: "banke", name: "Banke" },
  { id: "bardiya", name: "Bardiya" },
  { id: "kailali", name: "Kailali" },
];

export const AMENITIES: { id: string; label: string }[] = [
  { id: "wifi", label: "WiFi" },
  { id: "hot-water", label: "Hot Water" },
  { id: "kitchen", label: "Kitchen" },
  { id: "parking", label: "Parking" },
  { id: "garden", label: "Garden" },
  { id: "mountain-view", label: "Mountain View" },
  { id: "balcony", label: "Balcony" },
  { id: "fireplace", label: "Fireplace" },
  { id: "laundry", label: "Laundry" },
  { id: "ac", label: "AC" },
  { id: "heater", label: "Heater" },
  { id: "tv", label: "TV" },
  { id: "breakfast", label: "Breakfast Included" },
  { id: "airport-pickup", label: "Airport Pickup" },
  { id: "trekking-guide", label: "Trekking Guide" },
  { id: "yoga-space", label: "Yoga Space" },
  { id: "rooftop-terrace", label: "Rooftop Terrace" },
  { id: "traditional-decor", label: "Traditional Decor" },
];
