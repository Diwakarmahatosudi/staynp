"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  HiArrowLeft, HiArrowRight, HiUpload, HiX, HiCheck, HiLocationMarker,
  HiHome, HiPhotograph, HiCamera, HiExclamationCircle,
} from "react-icons/hi";
import { PropertyType, AMENITIES, NEPAL_DISTRICTS } from "@/types";
import { getPropertyTypeLabel } from "@/lib/mock-data";
import { validateImage, MAX_IMAGES, sanitizeInput } from "@/lib/validation";
import toast from "react-hot-toast";

const STEPS = ["Basics", "Location", "Details", "Photos", "Pricing"];
const PROPERTY_TYPES: PropertyType[] = ["house", "apartment", "homestay", "hotel", "lodge", "villa", "cottage", "heritage"];

interface PhotoItem {
  url: string;
  file: File | null;
  name: string;
  size: string;
}

export default function NewPropertyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "", type: "" as PropertyType, description: "",
    district: "", address: "", lat: "27.7172", lng: "85.3240",
    bedrooms: 1, beds: 1, bathrooms: 1, maxGuests: 2,
    amenities: [] as string[],
    pricePerNight: "", cleaningFee: "",
  });

  const update = (field: string, value: string | number | string[]) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => { const { [field]: _, ...r } = p; return r; });
  };

  const toggleAmenity = (a: string) => {
    const next = form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a];
    update("amenities", next);
  };

  const processFiles = useCallback((files: FileList | File[]) => {
    const remaining = MAX_IMAGES - photos.length;
    if (remaining <= 0) { toast.error(`Maximum ${MAX_IMAGES} photos allowed`); return; }

    const fileArray = Array.from(files).slice(0, remaining);
    const newPhotos: PhotoItem[] = [];
    const errs: string[] = [];

    for (const file of fileArray) {
      const err = validateImage(file);
      if (err) { errs.push(err); continue; }
      newPhotos.push({
        url: URL.createObjectURL(file),
        file,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(1) + "MB",
      });
    }

    if (errs.length > 0) errs.forEach((e) => toast.error(e, { duration: 4000 }));
    if (newPhotos.length > 0) {
      setPhotos((prev) => [...prev, ...newPhotos]);
      toast.success(`${newPhotos.length} photo${newPhotos.length > 1 ? "s" : ""} added`);
      if (errors.photos) setErrors((p) => { const { photos: _, ...r } = p; return r; });
    }
  }, [photos.length, errors]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) processFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const removed = prev[index];
      if (removed.url.startsWith("blob:")) URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== index);
    });
    toast("Photo removed", { icon: "🗑️" });
  };

  const movePhoto = (from: number, to: number) => {
    if (to < 0 || to >= photos.length) return;
    setPhotos((prev) => {
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  const validateStep = (): boolean => {
    const newErr: Record<string, string> = {};
    switch (currentStep) {
      case 0:
        if (sanitizeInput(form.title).length < 5) newErr.title = "Title must be at least 5 characters";
        if (sanitizeInput(form.title).length > 100) newErr.title = "Title cannot exceed 100 characters";
        if (!form.type) newErr.type = "Select a property type";
        if (sanitizeInput(form.description).length < 30) newErr.description = "Description must be at least 30 characters";
        if (sanitizeInput(form.description).length > 1000) newErr.description = "Description cannot exceed 1000 characters";
        break;
      case 1:
        if (!form.district) newErr.district = "Select a district";
        if (sanitizeInput(form.address).length < 3) newErr.address = "Enter a valid address";
        { const lat = parseFloat(form.lat); if (isNaN(lat) || lat < 26 || lat > 31) newErr.lat = "Invalid latitude for Nepal (26-31)"; }
        { const lng = parseFloat(form.lng); if (isNaN(lng) || lng < 80 || lng > 89) newErr.lng = "Invalid longitude for Nepal (80-89)"; }
        break;
      case 2:
        if (form.amenities.length === 0) newErr.amenities = "Select at least one amenity";
        break;
      case 3:
        if (photos.length === 0) newErr.photos = "Upload at least 1 photo";
        break;
      case 4: {
        const price = parseInt(form.pricePerNight);
        if (!form.pricePerNight || isNaN(price)) newErr.pricePerNight = "Enter a valid price";
        else if (price < 500) newErr.pricePerNight = "Minimum price is NPR 500/night";
        else if (price > 500000) newErr.pricePerNight = "Maximum price is NPR 500,000/night";
        if (form.cleaningFee) {
          const fee = parseInt(form.cleaningFee);
          if (isNaN(fee) || fee < 0) newErr.cleaningFee = "Enter a valid cleaning fee";
          if (fee > 50000) newErr.cleaningFee = "Cleaning fee cannot exceed NPR 50,000";
        }
        break;
      }
    }
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const goNext = () => { if (validateStep()) { setErrors({}); setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1)); } };
  const goBack = () => { setErrors({}); setCurrentStep((s) => Math.max(s - 1, 0)); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    toast.success("Property listed! 🎉 It will be reviewed within 24 hours.");
    router.push("/host");
  };

  return (
    <div className="min-h-screen bg-nepal-sand">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Link href="/host" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-nepal-crimson transition-colors">
          <HiArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="mb-2 font-heading text-2xl font-bold text-nepal-slate">List Your Property</h1>
        <p className="mb-8 text-sm text-gray-500">Share your space with travelers from around the world</p>

        {/* Progress */}
        <div className="mb-8 flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${i <= currentStep ? "bg-nepal-crimson text-white" : "bg-gray-200 text-gray-500"}`}>
                  {i < currentStep ? <HiCheck className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`mt-1 hidden text-[10px] sm:block ${i <= currentStep ? "text-nepal-crimson font-medium" : "text-gray-400"}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`mx-2 h-0.5 flex-1 ${i < currentStep ? "bg-nepal-crimson" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="card p-6">
          {/* ===== Step 0: Basics ===== */}
          {currentStep === 0 && (
            <div className="space-y-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-nepal-slate"><HiHome className="h-5 w-5 text-nepal-crimson" /> Property Basics</h2>
              <div>
                <label className="mb-1 block text-xs font-semibold text-nepal-slate">Property Title *</label>
                <input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Charming Homestay near Pokhara Lakeside" className={`input-field ${errors.title ? "border-red-400" : ""}`} maxLength={100} />
                <div className="mt-1 flex justify-between">
                  {errors.title ? <ErrMsg msg={errors.title} /> : <span />}
                  <span className="text-[10px] text-gray-400">{form.title.length}/100</span>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-nepal-slate">Property Type *</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PROPERTY_TYPES.map((t) => (
                    <button key={t} onClick={() => update("type", t)}
                      className={`rounded-xl border-2 px-3 py-2.5 text-xs font-medium transition-all active:scale-95 ${form.type === t ? "border-nepal-crimson bg-nepal-crimson/5 text-nepal-crimson" : "border-gray-100 text-gray-600 hover:border-gray-200"}`}>
                      {getPropertyTypeLabel(t)}
                    </button>
                  ))}
                </div>
                {errors.type && <ErrMsg msg={errors.type} />}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-nepal-slate">Description *</label>
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe your property, surroundings, what makes it special..." className={`input-field min-h-[120px] resize-y ${errors.description ? "border-red-400" : ""}`} maxLength={1000} />
                <div className="mt-1 flex justify-between">
                  {errors.description ? <ErrMsg msg={errors.description} /> : <span />}
                  <span className="text-[10px] text-gray-400">{form.description.length}/1000</span>
                </div>
              </div>
            </div>
          )}

          {/* ===== Step 1: Location ===== */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-nepal-slate"><HiLocationMarker className="h-5 w-5 text-nepal-crimson" /> Location</h2>
              <div>
                <label className="mb-1 block text-xs font-semibold text-nepal-slate">District *</label>
                <select value={form.district} onChange={(e) => update("district", e.target.value)} className={`input-field ${errors.district ? "border-red-400" : ""}`}>
                  <option value="">Select district...</option>
                  {NEPAL_DISTRICTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {errors.district && <ErrMsg msg={errors.district} />}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-nepal-slate">Address / Tole *</label>
                <input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="e.g. Lakeside Marg, Ward 6" className={`input-field ${errors.address ? "border-red-400" : ""}`} />
                {errors.address && <ErrMsg msg={errors.address} />}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-nepal-slate">Latitude</label>
                  <input value={form.lat} onChange={(e) => update("lat", e.target.value)} className={`input-field ${errors.lat ? "border-red-400" : ""}`} />
                  {errors.lat && <ErrMsg msg={errors.lat} />}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-nepal-slate">Longitude</label>
                  <input value={form.lng} onChange={(e) => update("lng", e.target.value)} className={`input-field ${errors.lng ? "border-red-400" : ""}`} />
                  {errors.lng && <ErrMsg msg={errors.lng} />}
                </div>
              </div>
              <div className="flex aspect-[16/9] items-center justify-center rounded-xl bg-nepal-mountain/10 text-center">
                <div>
                  <HiLocationMarker className="mx-auto mb-2 h-6 w-6 text-nepal-crimson" />
                  <p className="text-xs text-gray-500">Map pin drop available when Google Maps API is connected</p>
                </div>
              </div>
            </div>
          )}

          {/* ===== Step 2: Details ===== */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-nepal-slate">Property Details</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {(["bedrooms", "beds", "bathrooms", "maxGuests"] as const).map((key) => {
                  const labels: Record<string, string> = { bedrooms: "Bedrooms", beds: "Beds", bathrooms: "Bathrooms", maxGuests: "Max Guests" };
                  return (
                    <div key={key}>
                      <label className="mb-1 block text-xs font-semibold text-nepal-slate">{labels[key]}</label>
                      <div className="flex items-center gap-2">
                        <button onClick={() => update(key, Math.max(1, form[key] - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-lg hover:bg-gray-50 active:scale-90">−</button>
                        <span className="w-8 text-center font-semibold text-nepal-slate">{form[key]}</span>
                        <button onClick={() => update(key, Math.min(20, form[key] + 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-lg hover:bg-gray-50 active:scale-90">+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-nepal-slate">Amenities *</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {AMENITIES.map((a) => (
                    <button key={a.id} onClick={() => toggleAmenity(a.id)}
                      className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-xs font-medium transition-all active:scale-95 ${form.amenities.includes(a.id) ? "border-nepal-crimson bg-nepal-crimson/5 text-nepal-crimson" : "border-gray-100 text-gray-600 hover:border-gray-200"}`}>
                      {form.amenities.includes(a.id) && <HiCheck className="h-3.5 w-3.5" />}
                      {a.label}
                    </button>
                  ))}
                </div>
                {errors.amenities && <ErrMsg msg={errors.amenities} />}
                {form.amenities.length > 0 && <p className="mt-1 text-xs text-nepal-forest">{form.amenities.length} selected</p>}
              </div>
            </div>
          )}

          {/* ===== Step 3: Photos ===== */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-nepal-slate"><HiPhotograph className="h-5 w-5 text-nepal-crimson" /> Photos</h2>
              <p className="text-xs text-gray-500">Upload up to {MAX_IMAGES} photos. JPG, PNG, WebP under 10MB each. First photo is the cover.</p>

              {/* Upload options */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-nepal-gold-light bg-nepal-warm p-6 text-center transition-all hover:border-nepal-crimson active:scale-[0.98]"
                >
                  <HiUpload className="h-7 w-7 text-nepal-gold" />
                  <span className="text-xs font-semibold text-nepal-slate">Upload from Gallery</span>
                  <span className="text-[10px] text-gray-400">Select multiple photos</span>
                </button>
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-nepal-gold-light bg-nepal-warm p-6 text-center transition-all hover:border-nepal-crimson active:scale-[0.98]"
                >
                  <HiCamera className="h-7 w-7 text-nepal-gold" />
                  <span className="text-xs font-semibold text-nepal-slate">Take a Photo</span>
                  <span className="text-[10px] text-gray-400">Use your camera</span>
                </button>
              </div>

              <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />
              <input ref={cameraInputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={handleFileSelect} />

              {/* Drag & drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`hidden md:flex items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all ${isDragging ? "border-nepal-crimson bg-nepal-crimson/5" : "border-gray-200"}`}
              >
                <p className="text-xs text-gray-400">
                  {isDragging ? "Drop photos here!" : "Or drag & drop photos here"}
                </p>
              </div>

              {errors.photos && <ErrMsg msg={errors.photos} />}

              {/* Photo grid */}
              {photos.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-nepal-slate">{photos.length}/{MAX_IMAGES} photos</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {photos.map((photo, i) => (
                      <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-gray-100">
                        <Image src={photo.url} alt={`Photo ${i + 1}`} fill className="object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <p className="truncate text-[10px] text-white">{photo.name}</p>
                          <p className="text-[9px] text-white/60">{photo.size}</p>
                        </div>
                        <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {i > 0 && (
                            <button onClick={() => movePhoto(i, i - 1)} className="rounded-full bg-black/50 p-1 text-white hover:bg-black/70" title="Move left">
                              <HiArrowLeft className="h-3 w-3" />
                            </button>
                          )}
                          {i < photos.length - 1 && (
                            <button onClick={() => movePhoto(i, i + 1)} className="rounded-full bg-black/50 p-1 text-white hover:bg-black/70" title="Move right">
                              <HiArrowRight className="h-3 w-3" />
                            </button>
                          )}
                          <button onClick={() => removePhoto(i)} className="rounded-full bg-red-500/80 p-1 text-white hover:bg-red-600" title="Remove">
                            <HiX className="h-3 w-3" />
                          </button>
                        </div>
                        {i === 0 && <span className="absolute left-1.5 top-1.5 rounded bg-nepal-crimson px-1.5 py-0.5 text-[9px] font-bold text-white">COVER</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== Step 4: Pricing ===== */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-nepal-slate">Set Your Price</h2>
              <div>
                <label className="mb-1 block text-xs font-semibold text-nepal-slate">Price per Night (NPR) *</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-nepal-slate">रू</span>
                  <input type="number" value={form.pricePerNight} onChange={(e) => update("pricePerNight", e.target.value)} placeholder="3500" className={`input-field flex-1 text-xl ${errors.pricePerNight ? "border-red-400" : ""}`} min={500} max={500000} />
                </div>
                {errors.pricePerNight && <ErrMsg msg={errors.pricePerNight} />}
                <p className="mt-1 text-xs text-gray-400">StayNP takes a 5% service fee. You keep the rest.</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-nepal-slate">Cleaning Fee (NPR, optional)</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-nepal-slate">रू</span>
                  <input type="number" value={form.cleaningFee} onChange={(e) => update("cleaningFee", e.target.value)} placeholder="500" className={`input-field flex-1 ${errors.cleaningFee ? "border-red-400" : ""}`} />
                </div>
                {errors.cleaningFee && <ErrMsg msg={errors.cleaningFee} />}
              </div>
              {form.pricePerNight && parseInt(form.pricePerNight) >= 500 && (
                <div className="rounded-xl bg-nepal-warm p-4 space-y-1">
                  <p className="text-xs text-gray-500">Guest pays: <span className="font-semibold text-nepal-slate">NPR {parseInt(form.pricePerNight).toLocaleString()}/night</span></p>
                  <p className="text-xs text-gray-500">Service fee (5%): <span className="font-semibold text-gray-600">NPR {Math.round(parseInt(form.pricePerNight) * 0.05).toLocaleString()}</span></p>
                  <p className="text-xs text-gray-500">You earn: <span className="font-bold text-nepal-forest">NPR {Math.round(parseInt(form.pricePerNight) * 0.95).toLocaleString()}/night</span></p>
                  {form.cleaningFee && parseInt(form.cleaningFee) > 0 && (
                    <p className="text-xs text-gray-500">+ Cleaning fee: <span className="font-semibold text-nepal-slate">NPR {parseInt(form.cleaningFee).toLocaleString()}</span></p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            {currentStep > 0 ? (
              <button onClick={goBack} className="btn-secondary"><HiArrowLeft className="h-4 w-4" /> Back</button>
            ) : <div />}
            {currentStep < STEPS.length - 1 ? (
              <button onClick={goNext} className="btn-primary">Next <HiArrowRight className="h-4 w-4" /></button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="btn-primary disabled:opacity-50">
                {loading ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Publish Listing"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrMsg({ msg }: { msg: string }) {
  return <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><HiExclamationCircle className="h-3.5 w-3.5 shrink-0" /> {msg}</p>;
}
