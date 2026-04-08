// Nepal mobile numbers: 10 digits starting with 97 or 98
const NEPAL_MOBILE_REGEX = /^(97|98)\d{8}$/;

// Nepal landline prefixes
const NEPAL_LANDLINE_REGEX = /^0[1-9]\d{6,7}$/;

export function isValidNepalPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  return NEPAL_MOBILE_REGEX.test(cleaned);
}

export function formatNepalPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  return cleaned;
}

export function getPhoneError(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, "");
  if (!cleaned) return "Phone number is required";
  if (cleaned.length < 10) return "Phone number must be 10 digits";
  if (cleaned.length > 10) return "Phone number cannot exceed 10 digits";
  if (!cleaned.startsWith("97") && !cleaned.startsWith("98")) {
    return "Nepal mobile numbers start with 97 or 98";
  }
  if (!NEPAL_MOBILE_REGEX.test(cleaned)) return "Invalid Nepal mobile number";
  return null;
}

// Nepal mobile operator detection
export function getOperator(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("984") || cleaned.startsWith("985") || cleaned.startsWith("986")) return "NTC";
  if (cleaned.startsWith("980") || cleaned.startsWith("981") || cleaned.startsWith("982")) return "Ncell";
  if (cleaned.startsWith("974") || cleaned.startsWith("975")) return "NTC CDMA";
  if (cleaned.startsWith("972") || cleaned.startsWith("973")) return "NTC";
  if (cleaned.startsWith("961") || cleaned.startsWith("962")) return "NTC";
  if (cleaned.startsWith("988")) return "NTC";
  return "Nepal Mobile";
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const DISPOSABLE_DOMAINS = [
  "mailinator.com", "guerrillamail.com", "tempmail.com", "throwaway.email",
  "yopmail.com", "sharklasers.com", "trashmail.com", "fakeinbox.com",
];

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

export function getEmailError(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required";
  if (!trimmed.includes("@")) return "Email must contain @";
  if (!EMAIL_REGEX.test(trimmed)) return "Enter a valid email address";
  const domain = trimmed.split("@")[1]?.toLowerCase();
  if (DISPOSABLE_DOMAINS.includes(domain)) return "Disposable email addresses are not allowed";
  return null;
}

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  suggestions: string[];
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const suggestions: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else suggestions.push("At least 8 characters");

  if (password.length >= 12) score++;

  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  else suggestions.push("Mix uppercase and lowercase letters");

  if (/\d/.test(password)) score++;
  else suggestions.push("Include at least one number");

  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;
  else suggestions.push("Add a special character (!@#$%...)");

  // Common weak patterns
  const weak = ["password", "123456", "qwerty", "nepal", "kathmandu", "namaste"];
  if (weak.some((w) => password.toLowerCase().includes(w))) {
    score = Math.max(0, score - 2);
    suggestions.push("Avoid common words");
  }

  const labels: [string, string][] = [
    ["Very Weak", "bg-red-500"],
    ["Weak", "bg-orange-500"],
    ["Fair", "bg-yellow-500"],
    ["Strong", "bg-green-500"],
    ["Very Strong", "bg-nepal-forest"],
  ];

  const clamped = Math.min(4, Math.max(0, score));
  return { score: clamped, label: labels[clamped][0], color: labels[clamped][1], suggestions };
}

export function getPasswordError(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 128) return "Password is too long";
  if (!/[A-Z]/.test(password)) return "Include at least one uppercase letter";
  if (!/[a-z]/.test(password)) return "Include at least one lowercase letter";
  if (!/\d/.test(password)) return "Include at least one number";
  return null;
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

export function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z\s\u0900-\u097F'-]/g, "").trim();
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateEmailCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Image validation
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGES = 10;

export function validateImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `${file.name}: Only JPG, PNG, and WebP images are allowed`;
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return `${file.name}: Image must be under 10MB (this is ${(file.size / 1024 / 1024).toFixed(1)}MB)`;
  }
  return null;
}

// Rate limiting (client-side)
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}
