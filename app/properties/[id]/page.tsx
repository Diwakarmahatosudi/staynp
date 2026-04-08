"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HiStar, HiLocationMarker, HiShare, HiHeart, HiOutlineHeart,
  HiChevronLeft, HiCheck, HiX, HiChevronRight,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import BookingWidget from "@/components/BookingWidget";
import VerifiedBadge from "@/components/VerifiedBadge";
import { MOCK_PROPERTIES, MOCK_REVIEWS, formatNPR, getPropertyTypeLabel } from "@/lib/mock-data";
import toast from "react-hot-toast";

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const property = MOCK_PROPERTIES.find((p) => p.id === id);

  if (!property) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">🏔️</div>
          <h2 className="mb-2 text-xl font-semibold text-nepal-slate">Property not found</h2>
          <p className="mb-6 text-gray-500">This stay might have been removed.</p>
          <Link href="/properties" className="btn-primary">Browse all stays</Link>
        </div>
      </div>
    );
  }

  const reviews = MOCK_REVIEWS.filter((r) => r.property_id === property.id);
  const allImages = property.images.length > 0 ? property.images : [property.main_image_url];

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: property.title, text: property.description, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleSave = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    toast(next ? "Saved to your wishlist" : "Removed from wishlist", { icon: next ? "❤️" : "💔" });
  };

  return (
    <div className="min-h-screen bg-nepal-sand">
      {/* Photo Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95">
          <button onClick={() => setShowGallery(false)} className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors">
            <HiX className="h-6 w-6" />
          </button>
          <button
            onClick={() => setGalleryIndex((i) => (i === 0 ? allImages.length - 1 : i - 1))}
            className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
          >
            <HiChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => setGalleryIndex((i) => (i === allImages.length - 1 ? 0 : i + 1))}
            className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
          >
            <HiChevronRight className="h-6 w-6" />
          </button>
          <div className="relative h-[80vh] w-[90vw] max-w-5xl">
            <Image src={allImages[galleryIndex]} alt={`Photo ${galleryIndex + 1}`} fill className="object-contain" />
          </div>
          <div className="absolute bottom-6 text-sm text-white/70">
            {galleryIndex + 1} / {allImages.length}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/properties" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-nepal-crimson transition-colors">
          <HiChevronLeft className="h-4 w-4" />
          Back to search
        </Link>
      </div>

      {/* Image gallery grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-2 overflow-hidden rounded-2xl md:grid-cols-4 md:grid-rows-2 cursor-pointer" onClick={() => { setGalleryIndex(0); setShowGallery(true); }}>
          <div className="relative md:col-span-2 md:row-span-2">
            <div className="aspect-[4/3] md:aspect-auto md:h-full">
              <Image src={allImages[0]} alt={property.title} fill className="object-cover" priority />
            </div>
          </div>
          {allImages.slice(1, 5).map((img, i) => (
            <div key={i} className="relative hidden md:block">
              <div className="aspect-[4/3]">
                <Image src={img} alt={`${property.title} ${i + 2}`} fill className="object-cover" />
              </div>
              {i === 3 && allImages.length > 5 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="text-sm font-semibold text-white">+{allImages.length - 5} more</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() => { setGalleryIndex(0); setShowGallery(true); }}
          className="mt-2 text-sm font-medium text-nepal-crimson hover:underline md:hidden"
        >
          View all {allImages.length} photos
        </button>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="badge-type">{getPropertyTypeLabel(property.property_type)}</span>
                {property.is_verified && <VerifiedBadge size="sm" />}
              </div>
              <h1 className="mb-2 font-heading text-2xl font-bold text-nepal-slate md:text-3xl">{property.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <HiLocationMarker className="h-4 w-4 text-nepal-crimson" />
                  {property.address}, {property.district}
                </span>
                {property.average_rating && (
                  <span className="flex items-center gap-1">
                    <HiStar className="h-4 w-4 text-nepal-gold-dark" />
                    <span className="font-semibold text-nepal-slate">{property.average_rating}</span>
                    ({property.total_reviews} reviews)
                  </span>
                )}
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={handleShare} className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-all hover:border-nepal-crimson hover:text-nepal-crimson active:scale-95">
                  <HiShare className="h-4 w-4" /> Share
                </button>
                <button onClick={handleSave} className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-all hover:border-nepal-crimson hover:text-nepal-crimson active:scale-95">
                  {isFavorite ? <HiHeart className="h-4 w-4 text-nepal-crimson" /> : <HiOutlineHeart className="h-4 w-4" />}
                  {isFavorite ? "Saved" : "Save"}
                </button>
              </div>
            </div>

            <div className="mandala-divider mb-6"><span className="text-nepal-gold">✦</span></div>

            {property.host && (
              <div className="mb-6 flex items-center gap-4 rounded-xl bg-white p-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-full">
                  {property.host.avatar_url ? (
                    <Image src={property.host.avatar_url} alt={property.host.full_name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-nepal-crimson/10 text-xl font-bold text-nepal-crimson">
                      {property.host.full_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-nepal-slate">Hosted by {property.host.full_name}</p>
                  {property.host.is_verified && (
                    <span className="flex items-center gap-1 text-sm text-nepal-forest">
                      <MdVerified className="h-4 w-4" /> Verified Host
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="mb-6 grid grid-cols-3 gap-4">
              {[
                { label: "Bedrooms", value: property.bedrooms },
                { label: "Beds", value: property.beds },
                { label: "Bathrooms", value: property.bathrooms },
              ].map((d) => (
                <div key={d.label} className="rounded-xl bg-white p-4 text-center">
                  <p className="text-xl font-bold text-nepal-crimson">{d.value}</p>
                  <p className="text-xs text-gray-500">{d.label}</p>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold text-nepal-slate">About this stay</h2>
              <p className="leading-relaxed text-gray-600">{property.description}</p>
            </div>

            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold text-nepal-slate">Amenities</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {property.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 rounded-lg bg-white p-3 text-sm">
                    <HiCheck className="h-4 w-4 text-nepal-forest" /> {a}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold text-nepal-slate">Location</h2>
              <div className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl bg-nepal-mountain/10">
                <div className="text-center">
                  <HiLocationMarker className="mx-auto mb-2 h-8 w-8 text-nepal-crimson" />
                  <p className="text-sm font-medium text-nepal-slate">{property.address}, {property.district}</p>
                  <p className="mt-1 text-xs text-gray-500">{property.location_lat.toFixed(4)}°N, {property.location_lng.toFixed(4)}°E</p>
                  <p className="mt-2 text-xs text-gray-400">Connect Google Maps API to see interactive map</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-nepal-slate">
                <HiStar className="h-5 w-5 text-nepal-gold-dark" />
                {property.average_rating} · {property.total_reviews} reviews
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-xl bg-white p-4">
                      <div className="mb-2 flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full">
                          {review.guest?.avatar_url ? (
                            <Image src={review.guest.avatar_url} alt={review.guest.full_name} fill className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-sm font-bold text-gray-500">?</div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-nepal-slate">{review.guest?.full_name || "Anonymous"}</p>
                          <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <HiStar key={i} className="h-4 w-4 text-nepal-gold-dark" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-white p-8 text-center">
                  <p className="text-sm text-gray-500">No reviews yet. Be the first to stay here!</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <BookingWidget property={property} />
          </div>
        </div>
      </div>
    </div>
  );
}
