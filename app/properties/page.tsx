"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { HiAdjustments, HiSearch, HiX, HiLocationMarker } from "react-icons/hi";
import PropertyCard from "@/components/PropertyCard";
import { MOCK_PROPERTIES } from "@/lib/mock-data";
import { PROPERTY_TYPES, AMENITIES, NEPAL_REGIONS } from "@/types";

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-nepal-crimson border-t-transparent" />
            <p className="text-sm text-gray-500">Loading stays...</p>
          </div>
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}

function PropertiesContent() {
  const searchParams = useSearchParams();
  const initialLocation = searchParams.get("location") || "";
  const initialDistrict = searchParams.get("district") || "";
  const initialRegion = searchParams.get("region") || "";
  const initialType = searchParams.get("type") || "";

  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(initialLocation || initialDistrict);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("recommended");

  const filteredProperties = useMemo(() => {
    let results = [...MOCK_PROPERTIES];

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.region.toLowerCase().includes(q)
      );
    }

    if (initialRegion) {
      const region = NEPAL_REGIONS.find((r) => r.id === initialRegion);
      if (region) {
        results = results.filter((p) => p.region === region.name);
      }
    }

    if (selectedType) {
      results = results.filter((p) => p.property_type === selectedType);
    }

    results = results.filter(
      (p) =>
        p.price_per_night >= priceRange[0] &&
        p.price_per_night <= priceRange[1]
    );

    if (selectedAmenities.length > 0) {
      results = results.filter((p) =>
        selectedAmenities.every((a) => p.amenities.includes(a))
      );
    }

    switch (sortBy) {
      case "price-low":
        results.sort((a, b) => a.price_per_night - b.price_per_night);
        break;
      case "price-high":
        results.sort((a, b) => b.price_per_night - a.price_per_night);
        break;
      case "rating":
        results.sort(
          (a, b) => (b.average_rating || 0) - (a.average_rating || 0)
        );
        break;
      default:
        break;
    }

    return results;
  }, [search, initialRegion, selectedType, priceRange, selectedAmenities, sortBy]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedType("");
    setPriceRange([0, 20000]);
    setSelectedAmenities([]);
    setSortBy("recommended");
  };

  const activeFilterCount =
    (selectedType ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 20000 ? 1 : 0) +
    selectedAmenities.length;

  return (
    <div className="min-h-screen bg-nepal-sand">
      <div className="border-b border-nepal-gold-light/30 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <HiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location, district, or property name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                activeFilterCount > 0
                  ? "border-nepal-crimson bg-nepal-crimson/5 text-nepal-crimson"
                  : "border-gray-200 text-nepal-slate hover:border-gray-300"
              }`}
            >
              <HiAdjustments className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-nepal-crimson text-xs text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="border-b border-nepal-gold-light/30 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-nepal-slate">Filters</h3>
              <button onClick={clearFilters} className="text-xs font-medium text-nepal-crimson hover:underline">Clear all</button>
            </div>

            <div className="mb-6">
              <p className="mb-2 text-xs font-medium text-gray-500">Property Type</p>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(selectedType === type.value ? "" : type.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                      selectedType === type.value
                        ? "border-nepal-crimson bg-nepal-crimson text-white"
                        : "border-gray-200 text-gray-600 hover:border-nepal-crimson hover:text-nepal-crimson"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="mb-2 text-xs font-medium text-gray-500">Price Range (NPR per night)</p>
              <div className="flex items-center gap-3">
                <input type="number" placeholder="Min" value={priceRange[0] || ""} onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} className="input-field w-32" />
                <span className="text-gray-400">—</span>
                <input type="number" placeholder="Max" value={priceRange[1] === 20000 ? "" : priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 20000])} className="input-field w-32" />
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-gray-500">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((amenity) => (
                  <button
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.label)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                      selectedAmenities.includes(amenity.label)
                        ? "border-nepal-forest bg-nepal-forest text-white"
                        : "border-gray-200 text-gray-600 hover:border-nepal-forest hover:text-nepal-forest"
                    }`}
                  >
                    {amenity.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-nepal-slate">
              {filteredProperties.length} stay{filteredProperties.length !== 1 ? "s" : ""} found
              {search && <span className="text-gray-400"> in &ldquo;{search}&rdquo;</span>}
            </h1>
            {initialRegion && (
              <p className="flex items-center gap-1 text-sm text-gray-500">
                <HiLocationMarker className="h-4 w-4 text-nepal-crimson" />
                {NEPAL_REGIONS.find((r) => r.id === initialRegion)?.name}
              </p>
            )}
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-nepal-slate focus:border-nepal-crimson focus:outline-none">
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {activeFilterCount > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedType && (
              <span className="flex items-center gap-1 rounded-full bg-nepal-crimson/10 px-3 py-1 text-xs font-medium text-nepal-crimson">
                {PROPERTY_TYPES.find((t) => t.value === selectedType)?.label}
                <button onClick={() => setSelectedType("")} className="hover:text-nepal-crimson/70"><HiX className="h-3 w-3" /></button>
              </span>
            )}
            {selectedAmenities.map((amenity) => (
              <span key={amenity} className="flex items-center gap-1 rounded-full bg-nepal-forest/10 px-3 py-1 text-xs font-medium text-nepal-forest">
                {amenity}
                <button onClick={() => toggleAmenity(amenity)} className="hover:text-nepal-forest/70"><HiX className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}

        {filteredProperties.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white py-20 text-center">
            <div className="mx-auto mb-4 text-6xl">🏔️</div>
            <h3 className="mb-2 text-lg font-semibold text-nepal-slate">No stays found</h3>
            <p className="mb-6 text-sm text-gray-500">Try adjusting your filters or search for a different location</p>
            <button onClick={clearFilters} className="btn-secondary">Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
