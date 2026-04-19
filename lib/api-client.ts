/**
 * Typed fetch helpers for the StayNP backend. All routes rely on the
 * httpOnly `staynp_session` cookie, so `credentials: "include"` is set.
 */

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
      ...init,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: json?.error || `Request failed (${res.status})`, status: res.status };
    }
    return { ok: true, data: json as T };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error", status: 0 };
  }
}

// ===== Auth =====
export const api = {
  auth: {
    me: () => request<{ user: PublicUser | null }>("/api/auth/me"),
    signup: (body: {
      fullName: string;
      phone: string;
      email?: string;
      password: string;
      isHost?: boolean;
    }) =>
      request<{ user: PublicUser; next: "verify_phone" }>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    login: (body: { email?: string; phone?: string; password: string }) =>
      request<{ user: PublicUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    loginWithOtp: (body: { email?: string; phone?: string; code: string }) =>
      request<{ user: PublicUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ ...body, method: "otp" }),
      }),
    sendOtp: (body: {
      channel: "phone" | "email";
      target: string;
      purpose?: "signup" | "login" | "reset" | "verify";
    }) =>
      request<{ ok: true; expires_in: number; dev_code?: string }>(
        "/api/auth/send-otp",
        { method: "POST", body: JSON.stringify(body) }
      ),
    verifyOtp: (body: {
      channel: "phone" | "email";
      target: string;
      code: string;
      purpose?: "signup" | "login" | "reset" | "verify";
    }) =>
      request<{ ok: true; verified: true; user: PublicUser | null }>(
        "/api/auth/verify-otp",
        { method: "POST", body: JSON.stringify(body) }
      ),
    resetPassword: (body: {
      channel: "phone" | "email";
      target: string;
      code: string;
      password: string;
    }) =>
      request<{ ok: true }>("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  },

  properties: {
    list: (q: Record<string, string | number> = {}) => {
      const params = new URLSearchParams();
      Object.entries(q).forEach(([k, v]) => v !== undefined && params.set(k, String(v)));
      return request<{ properties: unknown[]; total: number }>(`/api/properties?${params}`);
    },
    get: (id: string) => request<{ property: unknown; reviews: unknown[] }>(`/api/properties/${id}`),
    create: (body: Record<string, unknown>) =>
      request<{ property: unknown }>("/api/properties", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Record<string, unknown>) =>
      request<{ property: unknown }>(`/api/properties/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    remove: (id: string) =>
      request<{ ok: true }>(`/api/properties/${id}`, { method: "DELETE" }),
  },

  bookings: {
    list: (role: "guest" | "host" = "guest") =>
      request<{ bookings: unknown[] }>(`/api/bookings?role=${role}`),
    get: (id: string) => request<{ booking: unknown }>(`/api/bookings/${id}`),
    create: (body: {
      property_id: string;
      check_in: string;
      check_out: string;
      guests_count: number;
      payment_method?: "esewa" | "khalti" | "card" | "bank_transfer";
      guest_phone?: string;
      guest_email?: string;
    }) =>
      request<{ booking: { id: string; total_price: number; nights: number; subtotal: number; service_fee: number } }>(
        "/api/bookings",
        { method: "POST", body: JSON.stringify(body) }
      ),
    updateStatus: (id: string, status: "pending" | "confirmed" | "cancelled" | "completed") =>
      request<{ booking: unknown }>(`/api/bookings/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  },

  payments: {
    esewa: (booking_id: string) =>
      request<{ payment_url: string; payload: Record<string, string>; transaction_uuid: string }>(
        "/api/payment/esewa",
        { method: "POST", body: JSON.stringify({ booking_id }) }
      ),
    khalti: (booking_id: string) =>
      request<{ payment_url: string; pidx: string }>("/api/payment/khalti", {
        method: "POST",
        body: JSON.stringify({ booking_id }),
      }),
  },

  reviews: {
    list: (property_id: string) =>
      request<{ reviews: unknown[] }>(`/api/reviews?property_id=${property_id}`),
    create: (body: { property_id: string; rating: number; comment?: string }) =>
      request<{ review: unknown }>("/api/reviews", { method: "POST", body: JSON.stringify(body) }),
  },

  upload: async (files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append("file", f));
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form, credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false as const, error: json?.error || "Upload failed", status: res.status };
      return { ok: true as const, data: json as { urls: string[] } };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Upload failed", status: 0 };
    }
  },
};

export interface PublicUser {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url?: string | null;
  is_host: boolean;
  is_verified: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  kyc_status?: string;
  created_at: string;
}
