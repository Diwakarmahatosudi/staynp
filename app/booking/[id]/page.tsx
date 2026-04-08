"use client";

import { Suspense, use, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { HiCalendar, HiUserGroup, HiShieldCheck, HiCheck, HiArrowLeft, HiPhone, HiExclamationCircle, HiCheckCircle } from "react-icons/hi";
import { MOCK_PROPERTIES, formatNPR } from "@/lib/mock-data";
import { PaymentMethod } from "@/types";
import { isValidNepalPhone, getPhoneError, getOperator, formatNepalPhone } from "@/lib/validation";
import toast from "react-hot-toast";

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-nepal-crimson border-t-transparent" /></div>}>
      <BookingContent id={id} />
    </Suspense>
  );
}

function BookingContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const property = MOCK_PROPERTIES.find((p) => p.id === id);

  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = parseInt(searchParams.get("guests") || "1");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("esewa");
  const [contactPhone, setContactPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState<"details" | "processing" | "confirmed">("details");
  const [loading, setLoading] = useState(false);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    return Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  if (!property) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="mb-2 text-xl">🏔️</p>
          <h2 className="mb-2 text-lg font-semibold">Property not found</h2>
          <Link href="/properties" className="btn-primary">Browse stays</Link>
        </div>
      </div>
    );
  }

  const subtotal = property.price_per_night * nights;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  const handleBooking = async () => {
    const pErr = getPhoneError(contactPhone);
    if (pErr) {
      setPhoneError(pErr);
      toast.error(pErr); return;
    }
    if (!agreed) {
      toast.error("Please agree to the cancellation policy"); return;
    }
    setLoading(true);
    setStep("processing");
    await new Promise((r) => setTimeout(r, 2500));
    setLoading(false);
    setStep("confirmed");
    toast.success("Booking confirmed! 🎉");
  };

  if (step === "confirmed") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-nepal-sand px-4">
        <div className="w-full max-w-lg text-center">
          <div className="card p-8">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-nepal-forest/10">
              <HiCheck className="h-10 w-10 text-nepal-forest" />
            </div>
            <h1 className="mb-2 font-heading text-2xl font-bold text-nepal-slate">Booking Confirmed!</h1>
            <p className="mb-6 text-sm text-gray-500">Your stay at {property.title} is booked.</p>
            <div className="mb-6 rounded-xl bg-nepal-sand p-4 text-left text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2 mb-2">
                <span className="text-gray-500">Booking ID</span>
                <span className="font-mono font-medium text-nepal-slate">SNP-{Date.now().toString(36).toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2 mb-2">
                <span className="text-gray-500">Dates</span>
                <span className="text-nepal-slate">{checkIn} → {checkOut}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2 mb-2">
                <span className="text-gray-500">Guests</span>
                <span className="text-nepal-slate">{guests}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2 mb-2">
                <span className="text-gray-500">Payment</span>
                <span className="text-nepal-slate capitalize">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Paid</span>
                <span className="font-bold text-nepal-crimson">{formatNPR(total)}</span>
              </div>
            </div>
            <p className="mb-6 text-xs text-gray-400">SMS confirmation sent to +977 {formatNepalPhone(contactPhone)} ({getOperator(contactPhone)})</p>
            <div className="flex gap-3">
              <button onClick={() => router.push("/properties")} className="btn-secondary flex-1">Explore More</button>
              <button onClick={() => router.push("/")} className="btn-primary flex-1">Go Home</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-nepal-sand px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-nepal-crimson border-t-transparent" />
          <h2 className="mb-2 text-lg font-semibold text-nepal-slate">Processing Payment...</h2>
          <p className="text-sm text-gray-500">Connecting to {paymentMethod === "esewa" ? "eSewa" : paymentMethod === "khalti" ? "Khalti" : paymentMethod} gateway</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nepal-sand">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <button onClick={() => router.back()} className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-nepal-crimson transition-colors">
          <HiArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="mb-8 font-heading text-2xl font-bold text-nepal-slate">Confirm & Pay</h1>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-6">
            <div className="card p-5">
              <h2 className="mb-4 text-sm font-semibold text-nepal-slate">Your Trip</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl bg-nepal-sand p-3">
                  <HiCalendar className="h-5 w-5 text-nepal-crimson" />
                  <div>
                    <p className="text-xs text-gray-500">Dates</p>
                    <p className="text-sm font-medium">{checkIn || "Select"} → {checkOut || "Select"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-nepal-sand p-3">
                  <HiUserGroup className="h-5 w-5 text-nepal-crimson" />
                  <div>
                    <p className="text-xs text-gray-500">Guests</p>
                    <p className="text-sm font-medium">{guests} guest{guests > 1 ? "s" : ""}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="mb-4 text-sm font-semibold text-nepal-slate">Contact Number</h2>
              <div className="flex gap-2">
                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
                  <HiPhone className="mr-1 h-4 w-4" /> 🇳🇵 +977
                </div>
                <div className="relative flex-1">
                  <input
                    type="tel" placeholder="98XXXXXXXX" value={contactPhone}
                    onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 10); setContactPhone(v); if (phoneError) setPhoneError(""); }}
                    className={`input-field pr-10 ${phoneError ? "border-red-400" : ""}`} maxLength={10}
                  />
                  {contactPhone.length === 10 && isValidNepalPhone(contactPhone) && (
                    <HiCheckCircle className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-nepal-forest" />
                  )}
                </div>
              </div>
              {phoneError && <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><HiExclamationCircle className="h-3.5 w-3.5" /> {phoneError}</p>}
              {contactPhone.length === 10 && isValidNepalPhone(contactPhone) && (
                <p className="mt-1 text-xs text-nepal-forest">✓ {getOperator(contactPhone)} — SMS will be sent to +977 {formatNepalPhone(contactPhone)}</p>
              )}
              {!phoneError && contactPhone.length < 10 && <p className="mt-1 text-xs text-gray-400">Valid Nepal number required (starts with 97 or 98)</p>}
            </div>

            <div className="card p-5">
              <h2 className="mb-4 text-sm font-semibold text-nepal-slate">Payment Method</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { id: "esewa" as PaymentMethod, label: "eSewa", color: "bg-green-600" },
                  { id: "khalti" as PaymentMethod, label: "Khalti", color: "bg-purple-600" },
                  { id: "card" as PaymentMethod, label: "Credit/Debit Card", color: "bg-blue-600" },
                  { id: "bank_transfer" as PaymentMethod, label: "Bank Transfer", color: "bg-gray-600" },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all active:scale-[0.98] ${paymentMethod === pm.id ? "border-nepal-crimson bg-nepal-crimson/5" : "border-gray-100 hover:border-gray-200"}`}
                  >
                    <div className={`flex h-8 w-12 items-center justify-center rounded-md ${pm.color} text-xs font-bold text-white`}>
                      {pm.label.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-nepal-slate">{pm.label}</span>
                    {paymentMethod === pm.id && <HiCheck className="ml-auto h-4 w-4 text-nepal-crimson" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-nepal-slate">
                <HiShieldCheck className="h-4 w-4 text-nepal-forest" /> Cancellation Policy
              </h2>
              <p className="mb-3 text-xs text-gray-500">Free cancellation up to 48 hours before check-in. 50% refund for cancellations within 48 hours. No refund for no-shows.</p>
              <label className="flex cursor-pointer items-center gap-2">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={agreed}
                  onClick={() => setAgreed(!agreed)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${agreed ? "border-nepal-crimson bg-nepal-crimson" : "border-gray-300 hover:border-nepal-crimson"}`}
                >
                  {agreed && <HiCheck className="h-3.5 w-3.5 text-white" />}
                </button>
                <span className="text-sm text-gray-600">I agree to the cancellation policy and house rules</span>
              </label>
            </div>

            <button
              onClick={handleBooking}
              disabled={loading}
              className="btn-primary w-full text-base disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>Confirm & Pay {formatNPR(total)}</>
              )}
            </button>
          </div>

          <div className="lg:col-span-2">
            <div className="card sticky top-24 p-5">
              <div className="mb-4 flex gap-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                  <Image src={property.main_image_url} alt={property.title} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-nepal-slate">{property.title}</h3>
                  <p className="text-xs text-gray-500">{property.district}</p>
                  {property.average_rating && (
                    <p className="mt-1 text-xs text-gray-400">★ {property.average_rating} ({property.total_reviews} reviews)</p>
                  )}
                </div>
              </div>
              <div className="mandala-divider my-4"><span className="bg-white px-2 text-nepal-gold text-xs">✦</span></div>
              <h3 className="mb-3 text-sm font-semibold text-nepal-slate">Price Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{formatNPR(property.price_per_night)} × {nights} night{nights > 1 ? "s" : ""}</span>
                  <span className="text-nepal-slate">{formatNPR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Service fee (5%)</span>
                  <span className="text-nepal-slate">{formatNPR(serviceFee)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold">
                  <span className="text-nepal-slate">Total</span>
                  <span className="text-nepal-crimson">{formatNPR(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
