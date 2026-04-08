"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiLocationMarker, HiCalendar, HiUserGroup, HiSearch } from "react-icons/hi";
import { NEPAL_DISTRICTS } from "@/types";
import toast from "react-hot-toast";

interface SearchBarProps {
  variant?: "hero" | "compact";
}

export default function SearchBar({ variant = "hero" }: SearchBarProps) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("district", location);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests > 1) params.set("guests", guests.toString());
    const qs = params.toString();
    router.push(`/properties${qs ? `?${qs}` : ""}`);
    toast.success("Searching for stays...");
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
        <select value={location} onChange={(e) => setLocation(e.target.value)} className="max-w-[140px] text-sm outline-none bg-transparent">
          <option value="">Anywhere</option>
          {NEPAL_DISTRICTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <span className="h-5 w-px bg-gray-200" />
        <input type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)} className="w-28 text-sm outline-none bg-transparent" />
        <span className="h-5 w-px bg-gray-200" />
        <button onClick={handleSearch} className="flex h-8 w-8 items-center justify-center rounded-full bg-nepal-crimson text-white hover:bg-nepal-crimson/90 active:scale-90">
          <HiSearch className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-nepal-slate">
            <HiLocationMarker className="h-3.5 w-3.5 text-nepal-crimson" /> Where
          </label>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="input-field">
            <option value="">Anywhere in Nepal</option>
            {NEPAL_DISTRICTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-nepal-slate">
            <HiCalendar className="h-3.5 w-3.5 text-nepal-crimson" /> Check-in
          </label>
          <input type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-nepal-slate">
            <HiCalendar className="h-3.5 w-3.5 text-nepal-crimson" /> Check-out
          </label>
          <input type="date" value={checkOut} min={checkIn || today} onChange={(e) => setCheckOut(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-nepal-slate">
            <HiUserGroup className="h-3.5 w-3.5 text-nepal-crimson" /> Guests
          </label>
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
              <button onClick={() => setGuests(Math.max(1, guests - 1))} className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-sm hover:bg-gray-50 active:scale-90">−</button>
              <span className="flex-1 text-center text-sm font-medium">{guests}</span>
              <button onClick={() => setGuests(Math.min(16, guests + 1))} className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-sm hover:bg-gray-50 active:scale-90">+</button>
            </div>
            <button onClick={handleSearch} className="flex h-10 w-10 items-center justify-center rounded-xl bg-nepal-crimson text-white hover:bg-nepal-crimson/90 active:scale-90 transition-transform">
              <HiSearch className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
