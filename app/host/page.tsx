"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HiPlus, HiCurrencyDollar, HiCalendar, HiStar, HiEye, HiPencil, HiTrendingUp, HiHome, HiCheck, HiX, HiTrash } from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import { MOCK_PROPERTIES, formatNPR } from "@/lib/mock-data";
import toast from "react-hot-toast";

const initialBookings = [
  { id: "b1", guestName: "Alex Johnson", property: "Traditional Newari Homestay in Bhaktapur", checkIn: "2026-04-15", checkOut: "2026-04-18", total: 10500, status: "confirmed" as const },
  { id: "b2", guestName: "Priya Patel", property: "Traditional Newari Homestay in Bhaktapur", checkIn: "2026-04-22", checkOut: "2026-04-25", total: 10500, status: "pending" as const },
  { id: "b3", guestName: "Marco Rossi", property: "Boutique Heritage Hotel in Patan", checkIn: "2026-05-01", checkOut: "2026-05-05", total: 48000, status: "confirmed" as const },
];

export default function HostDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "listings" | "bookings">("overview");
  const [bookings, setBookings] = useState(initialBookings);
  const [listings, setListings] = useState(MOCK_PROPERTIES.slice(0, 3).map((p) => ({ ...p })));
  const [kycUploaded, setKycUploaded] = useState(false);

  const confirmBooking = (id: string) => {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "confirmed" as const } : b));
    toast.success("Booking confirmed! Guest will receive SMS notification.");
  };

  const rejectBooking = (id: string) => {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "cancelled" as const } : b));
    toast("Booking rejected", { icon: "❌" });
  };

  const toggleListing = (id: string) => {
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, is_active: !l.is_active } : l));
    const listing = listings.find((l) => l.id === id);
    toast.success(listing?.is_active ? "Listing deactivated" : "Listing reactivated");
  };

  const deleteListing = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    toast.success("Listing removed");
  };

  const handleKycUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, WebP, or PDF files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    setKycUploaded(true);
    toast.success(`"${file.name}" uploaded! Verification pending (1-2 business days).`);
  };

  const totalEarnings = 285000;
  const monthlyEarnings = 48000;

  return (
    <div className="min-h-screen bg-nepal-sand">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-nepal-slate md:text-3xl">Host Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your properties and bookings</p>
          </div>
          <Link href="/host/new" className="btn-primary"><HiPlus className="h-4 w-4" /> Add Property</Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Earnings", value: formatNPR(totalEarnings), icon: HiCurrencyDollar, color: "text-nepal-crimson", bg: "bg-nepal-crimson/10" },
            { label: "This Month", value: formatNPR(monthlyEarnings), icon: HiTrendingUp, color: "text-nepal-forest", bg: "bg-nepal-forest/10" },
            { label: "Total Bookings", value: bookings.length.toString(), icon: HiCalendar, color: "text-nepal-mountain", bg: "bg-nepal-mountain/10" },
            { label: "Avg Rating", value: "4.8", icon: HiStar, color: "text-nepal-gold-dark", bg: "bg-nepal-gold/10" },
          ].map((stat) => (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl ${stat.bg} p-3`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-lg font-bold text-nepal-slate">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6 flex gap-1 rounded-xl bg-white p-1">
          {([["overview", "Overview", HiHome], ["listings", "My Listings", HiEye], ["bookings", "Bookings", HiCalendar]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${activeTab === id ? "bg-nepal-crimson text-white shadow-sm" : "text-gray-500 hover:text-nepal-slate"}`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <h3 className="mb-4 text-lg font-semibold text-nepal-slate">Recent Bookings</h3>
              <div className="space-y-3">
                {bookings.slice(0, 3).map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-lg bg-nepal-sand p-3">
                    <div>
                      <p className="text-sm font-semibold text-nepal-slate">{b.guestName}</p>
                      <p className="text-xs text-gray-500">{b.checkIn} → {b.checkOut}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-nepal-crimson">{formatNPR(b.total)}</p>
                      <span className={`text-xs font-medium ${b.status === "confirmed" ? "text-nepal-forest" : b.status === "cancelled" ? "text-red-500" : "text-yellow-600"}`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setActiveTab("bookings")} className="mt-3 text-sm font-medium text-nepal-crimson hover:underline">View all bookings →</button>
            </div>

            <div className="card p-6">
              <h3 className="mb-4 text-lg font-semibold text-nepal-slate">Verification Status</h3>
              {kycUploaded ? (
                <div className="rounded-xl border-2 border-nepal-forest/30 bg-nepal-forest/5 p-6 text-center">
                  <MdVerified className="mx-auto mb-3 h-10 w-10 text-nepal-forest" />
                  <p className="mb-1 text-sm font-semibold text-nepal-slate">Document Submitted</p>
                  <p className="text-xs text-gray-500">Your verification is being reviewed. You&apos;ll get the Verified Local badge within 1-2 business days.</p>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-nepal-gold-light bg-nepal-warm p-6 text-center">
                  <MdVerified className="mx-auto mb-3 h-10 w-10 text-nepal-gold" />
                  <p className="mb-1 text-sm font-semibold text-nepal-slate">Get Verified Local Badge</p>
                  <p className="mb-4 text-xs text-gray-500">Upload your Nagarikta (Citizenship) or Business License.</p>
                  <label className="btn-secondary cursor-pointer text-xs">
                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleKycUpload} />
                    Upload Document
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "listings" && (
          <div className="space-y-4">
            {listings.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="mb-4 text-gray-500">No listings yet.</p>
                <Link href="/host/new" className="btn-primary">Create Your First Listing</Link>
              </div>
            ) : (
              listings.map((property) => (
                <div key={property.id} className="card flex flex-col gap-4 p-4 sm:flex-row">
                  <div className="relative h-32 w-full overflow-hidden rounded-lg sm:w-40 shrink-0">
                    <Image src={property.main_image_url} alt={property.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-nepal-slate">{property.title}</h3>
                        <p className="text-xs text-gray-500">{property.address}, {property.district}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${property.is_active ? "bg-nepal-forest/10 text-nepal-forest" : "bg-gray-100 text-gray-500"}`}>
                        {property.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span className="font-semibold text-nepal-crimson">{formatNPR(property.price_per_night)}/night</span>
                      {property.average_rating && <span className="flex items-center gap-1"><HiStar className="h-3.5 w-3.5 text-nepal-gold-dark" />{property.average_rating}</span>}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={`/properties/${property.id}`} className="rounded-lg bg-nepal-sand px-3 py-1.5 text-xs font-medium text-nepal-slate hover:bg-gray-200 transition-colors active:scale-95">
                        <HiEye className="mr-1 inline h-3 w-3" /> View
                      </Link>
                      <button onClick={() => toast("Edit page coming soon!", { icon: "🔧" })} className="rounded-lg bg-nepal-sand px-3 py-1.5 text-xs font-medium text-nepal-slate hover:bg-gray-200 transition-colors active:scale-95">
                        <HiPencil className="mr-1 inline h-3 w-3" /> Edit
                      </button>
                      <button onClick={() => toggleListing(property.id)} className="rounded-lg bg-nepal-sand px-3 py-1.5 text-xs font-medium text-nepal-slate hover:bg-gray-200 transition-colors active:scale-95">
                        {property.is_active ? <><HiX className="mr-1 inline h-3 w-3" /> Deactivate</> : <><HiCheck className="mr-1 inline h-3 w-3" /> Reactivate</>}
                      </button>
                      <button onClick={() => deleteListing(property.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors active:scale-95">
                        <HiTrash className="mr-1 inline h-3 w-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-nepal-slate">{booking.guestName}</p>
                  <p className="text-xs text-gray-500">{booking.property}</p>
                  <p className="mt-1 text-xs text-gray-400">{booking.checkIn} → {booking.checkOut}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold text-nepal-crimson">{formatNPR(booking.total)}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${booking.status === "confirmed" ? "bg-nepal-forest/10 text-nepal-forest" : booking.status === "cancelled" ? "bg-red-50 text-red-500" : "bg-yellow-50 text-yellow-700"}`}>
                    {booking.status}
                  </span>
                  {booking.status === "pending" && (
                    <div className="flex gap-1">
                      <button onClick={() => confirmBooking(booking.id)} className="rounded-lg bg-nepal-forest/10 px-3 py-1.5 text-xs font-medium text-nepal-forest hover:bg-nepal-forest/20 transition-colors active:scale-95">
                        <HiCheck className="mr-1 inline h-3 w-3" /> Accept
                      </button>
                      <button onClick={() => rejectBooking(booking.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors active:scale-95">
                        <HiX className="mr-1 inline h-3 w-3" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
