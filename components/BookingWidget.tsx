"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { HiCalendar, HiUserGroup, HiStar } from "react-icons/hi";
import { Property } from "@/types";
import { formatNPR } from "@/lib/mock-data";
import toast from "react-hot-toast";

interface BookingWidgetProps {
  property: Property;
}

export default function BookingWidget({ property }: BookingWidgetProps) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState(1);

  const nights = useMemo(() => {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    return Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  const subtotal = property.price_per_night * nights;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  const handleReserve = () => {
    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      toast.error("Check-out must be after check-in");
      return;
    }
    router.push(`/booking/${property.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  return (
    <div className="card sticky top-24 p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-bold text-nepal-crimson">{formatNPR(property.price_per_night)}</span>
          <span className="text-sm text-gray-500"> / night</span>
        </div>
        {property.average_rating && (
          <span className="flex items-center gap-1 text-sm">
            <HiStar className="h-4 w-4 text-nepal-gold-dark" />
            <span className="font-medium">{property.average_rating}</span>
          </span>
        )}
      </div>

      <div className="mb-4 overflow-hidden rounded-xl border border-gray-200">
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          <div className="p-3">
            <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase text-gray-500">
              <HiCalendar className="h-3 w-3" /> Check-in
            </label>
            <input type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)} className="w-full text-sm font-medium text-nepal-slate outline-none" />
          </div>
          <div className="p-3">
            <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase text-gray-500">
              <HiCalendar className="h-3 w-3" /> Check-out
            </label>
            <input type="date" value={checkOut} min={checkIn || today} onChange={(e) => setCheckOut(e.target.value)} className="w-full text-sm font-medium text-nepal-slate outline-none" />
          </div>
        </div>
        <div className="border-t border-gray-200 p-3">
          <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase text-gray-500">
            <HiUserGroup className="h-3 w-3" /> Guests
          </label>
          <div className="flex items-center gap-3">
            <button onClick={() => setGuests(Math.max(1, guests - 1))} className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-sm hover:bg-gray-50 active:scale-90">−</button>
            <span className="text-sm font-medium">{guests} guest{guests > 1 ? "s" : ""}</span>
            <button onClick={() => setGuests(Math.min(property.max_guests, guests + 1))} className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-sm hover:bg-gray-50 active:scale-90">+</button>
            <span className="ml-auto text-xs text-gray-400">Max {property.max_guests}</span>
          </div>
        </div>
      </div>

      <button onClick={handleReserve} className="btn-primary mb-4 w-full text-base">Reserve</button>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 underline decoration-dotted">{formatNPR(property.price_per_night)} × {nights} night{nights > 1 ? "s" : ""}</span>
          <span>{formatNPR(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 underline decoration-dotted">Service fee</span>
          <span>{formatNPR(serviceFee)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-100 pt-2 font-bold">
          <span>Total</span>
          <span className="text-nepal-crimson">{formatNPR(total)}</span>
        </div>
      </div>
    </div>
  );
}
