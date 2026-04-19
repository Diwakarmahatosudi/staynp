"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiArrowRight,
  HiArrowLeft,
  HiShieldCheck,
  HiEye,
  HiEyeOff,
  HiExclamationCircle,
  HiCheckCircle,
  HiRefresh,
} from "react-icons/hi";
import toast from "react-hot-toast";
import {
  isValidNepalPhone,
  getPhoneError,
  getOperator,
  formatNepalPhone,
  isValidEmail,
  getEmailError,
  getPasswordError,
  checkPasswordStrength,
  sanitizeName,
  checkRateLimit,
} from "@/lib/validation";
import { api } from "@/lib/api-client";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneTimer, setPhoneTimer] = useState(0);
  const [showOtpInput, setShowOtpInput] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const clearErrors = useCallback(() => setErrors({}), []);
  const pwStrength = checkPasswordStrength(password);

  useEffect(() => {
    if (phoneTimer <= 0) return;
    const id = setInterval(() => setPhoneTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [phoneTimer]);

  // ─── Step 1: verify phone via OTP ───────────────────────────────────────
  const handleSendPhoneOtp = async () => {
    const err = getPhoneError(phone);
    if (err) {
      setErrors((p) => ({ ...p, phone: err }));
      return;
    }

    const rl = checkRateLimit("signup-otp", 3, 60000);
    if (!rl.allowed) {
      toast.error(`Too many attempts. Wait ${Math.ceil(rl.retryAfterMs / 1000)}s`);
      return;
    }

    setLoading(true);
    const res = await api.auth.sendOtp({ channel: "phone", target: phone, purpose: "signup" });
    setLoading(false);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }

    setShowOtpInput(true);
    setPhoneTimer(120);
    toast.success(`OTP sent to +977 ${formatNepalPhone(phone)}`);
    if (res.data.dev_code) {
      console.log(`[DEV] OTP: ${res.data.dev_code}`);
      toast(`Dev — OTP: ${res.data.dev_code}`, { icon: "🔑", duration: 12000 });
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (phoneOtp.length !== 6) {
      setErrors((p) => ({ ...p, phoneOtp: "Enter 6-digit code" }));
      return;
    }
    setLoading(true);
    const res = await api.auth.verifyOtp({
      channel: "phone",
      target: phone,
      code: phoneOtp,
      purpose: "signup",
    });
    setLoading(false);

    if (!res.ok) {
      setErrors((p) => ({ ...p, phoneOtp: res.error }));
      return;
    }

    setPhoneVerified(true);
    setShowOtpInput(false);
    toast.success("Phone verified! ✓");
  };

  // ─── Validation ─────────────────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const newErr: Record<string, string> = {};
    const cleanName = sanitizeName(fullName);
    if (cleanName.length < 2) newErr.fullName = "Full name must be at least 2 characters";
    else if (cleanName.split(" ").length < 2) newErr.fullName = "Please enter your full name (first and last)";

    const phoneErr = getPhoneError(phone);
    if (phoneErr) newErr.phone = phoneErr;
    else if (!phoneVerified) newErr.phone = "Please verify your phone number first";

    if (email) {
      const emailErr = getEmailError(email);
      if (emailErr) newErr.email = emailErr;
    }

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErr: Record<string, string> = {};
    const passErr = getPasswordError(password);
    if (passErr) newErr.password = passErr;
    if (password !== confirmPassword) newErr.confirmPassword = "Passwords don't match";
    if (!agreeTerms) newErr.terms = "You must agree to the Terms & Privacy Policy";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const goStep2 = () => {
    if (validateStep1()) {
      clearErrors();
      setStep(2);
    }
  };

  // ─── Step 2: create account via API ─────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    const res = await api.auth.signup({
      fullName,
      phone,
      email: email || undefined,
      password,
      isHost,
    });
    setLoading(false);

    if (!res.ok) {
      toast.error(res.error);
      // Re-show relevant field error
      if (res.error.toLowerCase().includes("phone")) setErrors({ phone: res.error });
      else if (res.error.toLowerCase().includes("email")) setErrors({ email: res.error });
      return;
    }

    toast.success("Account created! स्वागत छ!");
    setStep(3);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-nepal-sand px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-nepal-crimson">
            <span className="text-2xl font-bold text-white">स्</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-nepal-slate">
            Join Stay<span className="text-nepal-crimson">NP</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500">स्वागत छ! Create your account</p>
        </div>

        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? "w-8 bg-nepal-crimson" : s < step ? "w-8 bg-nepal-forest" : "w-2 bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="card p-6">
          {/* ========== STEP 1 ========== */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-nepal-slate">Your Details</h2>

              <div>
                <label className="mb-1 block text-xs font-semibold text-nepal-slate">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sita Sharma"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(sanitizeName(e.target.value));
                    if (errors.fullName) setErrors((p) => ({ ...p, fullName: "" }));
                  }}
                  className={`input-field ${errors.fullName ? "border-red-400" : ""}`}
                />
                {errors.fullName && <FieldError msg={errors.fullName} />}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-nepal-slate">Nepal Mobile Number *</label>
                <div className="flex gap-2">
                  <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
                    🇳🇵 +977
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      placeholder="98XXXXXXXX"
                      value={phone}
                      onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setPhone(d);
                        setPhoneVerified(false);
                        setShowOtpInput(false);
                        if (errors.phone) setErrors((p) => ({ ...p, phone: "" }));
                      }}
                      className={`input-field pr-10 ${errors.phone ? "border-red-400" : ""}`}
                      maxLength={10}
                      disabled={phoneVerified}
                    />
                    {phoneVerified && (
                      <HiCheckCircle className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-nepal-forest" />
                    )}
                  </div>
                </div>

                {phone.length === 10 && isValidNepalPhone(phone) && !phoneVerified && !showOtpInput && (
                  <button
                    onClick={handleSendPhoneOtp}
                    disabled={loading}
                    className="mt-2 flex items-center gap-1 text-xs font-semibold text-nepal-crimson hover:underline disabled:opacity-50"
                  >
                    {loading ? "Sending..." : (<>Verify this number <HiArrowRight className="h-3 w-3" /></>)}
                  </button>
                )}

                {phoneVerified && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-nepal-forest">
                    <HiCheckCircle className="h-3.5 w-3.5" /> Verified ({getOperator(phone)})
                  </p>
                )}

                {errors.phone && <FieldError msg={errors.phone} />}

                {showOtpInput && !phoneVerified && (
                  <div className="mt-3 space-y-2 rounded-xl border border-nepal-gold-light bg-nepal-warm p-3">
                    <label className="block text-xs font-semibold text-nepal-slate">
                      Enter OTP sent to +977 {formatNepalPhone(phone)}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="6-digit code"
                      value={phoneOtp}
                      onChange={(e) => {
                        setPhoneOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                        if (errors.phoneOtp) setErrors((p) => ({ ...p, phoneOtp: "" }));
                      }}
                      className={`input-field text-center font-mono tracking-[0.4em] ${errors.phoneOtp ? "border-red-400" : ""}`}
                      maxLength={6}
                      autoFocus
                    />
                    {errors.phoneOtp && <FieldError msg={errors.phoneOtp} />}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={handleVerifyPhoneOtp}
                        disabled={loading || phoneOtp.length < 6}
                        className="rounded-lg bg-nepal-crimson px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {loading ? "Verifying..." : "Verify"}
                      </button>
                      <button
                        onClick={handleSendPhoneOtp}
                        disabled={phoneTimer > 0 || loading}
                        className="text-xs text-gray-500 hover:text-nepal-crimson disabled:text-gray-300"
                      >
                        <HiRefresh className="mr-1 inline h-3 w-3" />
                        {phoneTimer > 0 ? `${phoneTimer}s` : "Resend"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-nepal-slate">
                  Email <span className="text-gray-400">(optional but recommended)</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                    }}
                    className={`input-field ${errors.email ? "border-red-400" : ""}`}
                  />
                  {email && isValidEmail(email) && (
                    <HiCheckCircle className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-nepal-forest" />
                  )}
                </div>
                {errors.email && <FieldError msg={errors.email} />}
              </div>

              <button onClick={goStep2} className="btn-primary w-full">
                Continue <HiArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ========== STEP 2 ========== */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-nepal-slate">Secure Your Account</h2>

              <div>
                <label className="mb-1 block text-xs font-semibold text-nepal-slate">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars, uppercase, lowercase, number"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((p) => ({ ...p, password: "" }));
                    }}
                    className={`input-field pr-10 ${errors.password ? "border-red-400" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-nepal-slate"
                  >
                    {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <FieldError msg={errors.password} />}

                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="mb-1 flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            i <= pwStrength.score ? pwStrength.color : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p
                      className={`text-xs font-medium ${
                        pwStrength.score >= 3
                          ? "text-nepal-forest"
                          : pwStrength.score >= 2
                            ? "text-yellow-600"
                            : "text-red-500"
                      }`}
                    >
                      {pwStrength.label}
                    </p>
                    {pwStrength.suggestions.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {pwStrength.suggestions.map((s) => (
                          <li key={s} className="text-[10px] text-gray-400">• {s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-nepal-slate">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: "" }));
                    }}
                    className={`input-field pr-10 ${errors.confirmPassword ? "border-red-400" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-nepal-slate"
                  >
                    {showConfirm ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmPassword && password === confirmPassword && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-nepal-forest">
                    <HiCheckCircle className="h-3.5 w-3.5" /> Passwords match
                  </p>
                )}
                {errors.confirmPassword && <FieldError msg={errors.confirmPassword} />}
              </div>

              <div className="rounded-xl border border-nepal-gold-light bg-nepal-warm p-4">
                <label className="flex cursor-pointer items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-nepal-slate">I want to host properties</p>
                    <p className="text-xs text-gray-500">You can also enable this later</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isHost}
                    onClick={() => setIsHost(!isHost)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${isHost ? "bg-nepal-crimson" : "bg-gray-200"}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                        isHost ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </label>
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-2">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={agreeTerms}
                    onClick={() => {
                      setAgreeTerms(!agreeTerms);
                      if (errors.terms) setErrors((p) => ({ ...p, terms: "" }));
                    }}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                      agreeTerms
                        ? "border-nepal-crimson bg-nepal-crimson"
                        : errors.terms
                          ? "border-red-400"
                          : "border-gray-300 hover:border-nepal-crimson"
                    }`}
                  >
                    {agreeTerms && <HiCheckCircle className="h-3.5 w-3.5 text-white" />}
                  </button>
                  <span className="text-xs text-gray-600">
                    I agree to the{" "}
                    <Link href="/terms" className="text-nepal-crimson hover:underline" target="_blank">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-nepal-crimson hover:underline" target="_blank">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.terms && <FieldError msg={errors.terms} />}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep(1);
                    clearErrors();
                  }}
                  className="btn-secondary flex-1"
                >
                  <HiArrowLeft className="h-4 w-4" /> Back
                </button>
                <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
                  {loading ? <Spinner /> : "Create Account"}
                </button>
              </div>
            </div>
          )}

          {/* ========== STEP 3 ========== */}
          {step === 3 && (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-nepal-forest/10">
                <HiShieldCheck className="h-8 w-8 text-nepal-forest" />
              </div>
              <h2 className="mb-2 text-lg font-semibold text-nepal-slate">स्वागत छ! Welcome!</h2>
              <p className="mb-1 text-sm text-gray-500">Your StayNP account has been created.</p>
              <p className="mb-6 text-xs text-gray-400">Verified: +977 {formatNepalPhone(phone)}</p>
              <div className="space-y-3">
                <button onClick={() => router.push("/properties")} className="btn-primary w-full">
                  Explore Stays
                </button>
                {isHost && (
                  <button onClick={() => router.push("/host/new")} className="btn-secondary w-full">
                    List Your Property
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {step < 3 && (
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-nepal-crimson hover:underline">
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
      <HiExclamationCircle className="h-3.5 w-3.5 shrink-0" /> {msg}
    </p>
  );
}

function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />;
}
