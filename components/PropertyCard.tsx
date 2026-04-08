"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { HiHeart, HiOutlineHeart, HiStar, HiLocationMarker, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import { Property } from "@/types";
import { formatNPR, getPropertyTypeLabel } from "@/lib/mock-data";
import toast from "react-hot-toast";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const images = property.images.length > 0 ? property.images : [property.main_image_url];

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !isFavorite;
    setIsFavorite(next);
    toast(next ? "Saved to wishlist" : "Removed from wishlist", {
      icon: next ? "❤️" : "💔",
    });
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Link href={`/properties/${property.id}`} className="group block">
      <div className="card overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={images[currentImage]}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          <button onClick={toggleFavorite} className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-2 backdrop-blur-sm transition-all hover:bg-white hover:scale-110 active:scale-95">
            {isFavorite ? <HiHeart className="h-5 w-5 text-nepal-crimson" /> : <HiOutlineHeart className="h-5 w-5 text-nepal-slate" />}
          </button>

          <div className="absolute left-3 top-3 z-10">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-nepal-slate backdrop-blur-sm">
              {getPropertyTypeLabel(property.property_type)}
            </span>
          </div>

          {property.is_verified && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="flex items-center gap-1 rounded-full bg-nepal-forest/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                <MdVerified className="h-3.5 w-3.5" />
                Verified Local
              </span>
            </div>
          )}

          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-1 opacity-0 shadow-md transition-all hover:bg-white group-hover:opacity-100 active:scale-90">
                <HiChevronLeft className="h-4 w-4 text-nepal-slate" />
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-1 opacity-0 shadow-md transition-all hover:bg-white group-hover:opacity-100 active:scale-90">
                <HiChevronRight className="h-4 w-4 text-nepal-slate" />
              </button>
              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImage(i); }}
                    className={`h-1.5 rounded-full transition-all ${i === currentImage ? "w-4 bg-white" : "w-1.5 bg-white/60 hover:bg-white/80"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-4">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-semibold text-nepal-slate group-hover:text-nepal-crimson transition-colors">
              {property.title}
            </h3>
            {property.average_rating && (
              <div className="flex items-center gap-1 shrink-0">
                <HiStar className="h-4 w-4 text-nepal-gold-dark" />
                <span className="text-sm font-medium">{property.average_rating}</span>
              </div>
            )}
          </div>
          <div className="mb-2 flex items-center gap-1 text-xs text-gray-500">
            <HiLocationMarker className="h-3.5 w-3.5 text-nepal-crimson/60" />
            <span>{property.address}, {property.district}</span>
          </div>
          <p className="mb-3 line-clamp-2 text-xs text-gray-500">
            {property.beds} bed{property.beds > 1 ? "s" : ""} · {property.bedrooms} bedroom{property.bedrooms > 1 ? "s" : ""} · {property.bathrooms} bath{property.bathrooms > 1 ? "s" : ""}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="price-tag">{formatNPR(property.price_per_night)}</span>
            <span className="text-xs text-gray-500">/ night</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
