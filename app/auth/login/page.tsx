"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiPhone, HiMail, HiArrowRight, HiEye, HiEyeOff, HiExclamationCircle, HiCheckCircle, HiRefresh } from "react-icons/hi";
import toast from "react-hot-toast";
import {
  isValidNepalPhone, getPhoneError, getOperator, formatNepalPhone,
  isValidEmail, getEmailError, getPasswordError,
  generateOTP, generateEmailCode, checkRateLimit, sanitizeInput,
} from "@/lib/validation";

type AuthMethod = "phone" | "email";
type PhoneStep = "enter" | "otp";
type EmailStep = "enter" | "verify";

export default function LoginPage() {
  const router = useRouter();
  const [method, setMethod] = useState<AuthMethod>("phone");

  // Phone state
  const [phone, setPhone] = useState("");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("enter");
  const [otp, setOtp] = useState("");
  const [sentOtp, setSentOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpAttempts, setOtpAttempts] = useState(0);

  // Email state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailStep, setEmailStep] = useState<EmailStep>("enter");
  const [emailCode, setEmailCode] = useState("");
  const [sentEmailCode, setSentEmailCode] = useState("");
  const [emailTimer, setEmailTimer] = useState(0);

  // General
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Email code countdown timer
  useEffect(() => {
    if (emailTimer <= 0) return;
    const interval = setInterval(() => setEmailTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [emailTimer]);

  const clearErrors = useCallback(() => setErrors({}), []);

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
    if (errors.phone) {
      const err = getPhoneError(digits);
      if (!err) setErrors((prev) => { const { phone: _, ...rest } = prev; return rest; });
    }
  };

  const handleSendOTP = async () => {
    const phoneErr = getPhoneError(phone);
    if (phoneErr) { setErrors({ phone: phoneErr }); return; }

    const rl = checkRateLimit("otp-send", 3, 60000);
    if (!rl.allowed) {
      toast.error(`Too many attempts. Try again in ${Math.ceil(rl.retryAfterMs / 1000)}s`);
      return;
    }

    setLoading(true);
    clearErrors();
    await new Promise((r) => setTimeout(r, 1500));

    const code = generateOTP();
    setSentOtp(code);
    setPhoneStep("otp");
    setOtpTimer(120);
    setOtpAttempts(0);
    setLoading(false);

    const operator = getOperator(phone);
    toast.success(`OTP sent to +977 ${formatNepalPhone(phone)} (${operator})`, { duration: 4000 });

    // In dev mode, show the code
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] OTP Code: ${code}`);
      toast(`Dev mode — OTP: ${code}`, { icon: "🔑", duration: 10000 });
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { setErrors({ otp: "Enter the full 6-digit code" }); return; }

    if (otpAttempts >= 5) {
      toast.error("Too many wrong attempts. Request a new OTP.");
      setPhoneStep("enter");
      setOtp("");
      return;
    }

    setLoading(true);
    clearErrors();
    await new Promise((r) => setTimeout(r, 1200));

    if (otp !== sentOtp) {
      setOtpAttempts((a) => a + 1);
      setErrors({ otp: `Invalid code. ${4 - otpAttempts} attempts remaining.` });
      setLoading(false);
      return;
    }

    setLoading(false);
    toast.success("नमस्ते! Welcome back!");
    router.push("/");
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0) return;
    setOtp("");
    setSentOtp("");
    await handleSendOTP();
  };

  const handleEmailLogin = async () => {
    const newErrors: Record<string, string> = {};
    const emailErr = getEmailError(email);
    const passErr = getPasswordError(password);
    if (emailErr) newErrors.email = emailErr;
    if (passErr) newErrors.password = passErr;

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const rl = checkRateLimit("email-login", 5, 60000);
    if (!rl.allowed) {
      toast.error(`Too many attempts. Try again in ${Math.ceil(rl.retryAfterMs / 1000)}s`);
      return;
    }

    setLoading(true);
    clearErrors();
    await new Promise((r) => setTimeout(r, 1500));

    // Send verification code to email
    const code = generateEmailCode();
    setSentEmailCode(code);
    setEmailStep("verify");
    setEmailTimer(300);
    setLoading(false);

    toast.success(`Verification code sent to ${email}`, { duration: 4000 });

    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] Email Code: ${code}`);
      toast(`Dev mode — Code: ${code}`, { icon: "🔑", duration: 10000 });
    }
  };

  const handleVerifyEmailCode = async () => {
    if (emailCode.length !== 6) { setErrors({ emailCode: "Enter the full 6-digit code" }); return; }

    setLoading(true);
    clearErrors();
    await new Promise((r) => setTimeout(r, 1200));

    if (emailCode !== sentEmailCode) {
      setErrors({ emailCode: "Invalid verification code" });
      setLoading(false);
      return;
    }

    setLoading(false);
    toast.success("नमस्ते! Welcome back!");
    router.push("/");
  };

  const handleGoogleLogin = () => {
    toast("Google login will be available once Supabase is connected", { icon: "🔗" });
  };

  const switchMethod = (m: AuthMethod) => {
    setMethod(m);
    setPhoneStep("enter");
    setEmailStep("enter");
    setOtp("");
    setEmailCode("");
    clearErrors();
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-nepal-sand px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-nepal-crimson">
            <span className="text-2xl font-bold text-white">स्</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-nepal-slate">
            Welcome to Stay<span className="text-nepal-crimson">NP</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500">नमस्ते! Log in to continue</p>
        </div>

        <div className="card p-6">
          {/* Method toggle */}
          <div className="mb-6 flex rounded-xl bg-nepal-sand p-1">
            {(["phone", "email"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMethod(m)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${method === m ? "bg-white text-nepal-crimson shadow-sm" : "text-gray-500 hover:text-nepal-slate"}`}
              >
                {m === "phone" ? <HiPhone className="h-4 w-4" /> : <HiMail className="h-4 w-4" />}
                {m === "phone" ? "Phone" : "Email"}
              </button>
            ))}
          </div>

          {/* ========== PHONE LOGIN ========== */}
          {method === "phone" && phoneStep === "enter" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-nepal-slate">Nepal Mobile Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
                    🇳🇵 +977
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      placeholder="98XXXXXXXX"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={`input-field pr-10 ${errors.phone ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                      maxLength={10}
                    />
                    {phone.length === 10 && !errors.phone && (
                      <HiCheckCircle className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-nepal-forest" />
                    )}
                  </div>
                </div>
                {errors.phone && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <HiExclamationCircle className="h-3.5 w-3.5" /> {errors.phone}
                  </p>
                )}
                {phone.length === 10 && isValidNepalPhone(phone) && (
                  <p className="mt-1 text-xs text-nepal-forest">
                    ✓ {getOperator(phone)} number detected
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">We&apos;ll send a 6-digit OTP via SMS</p>
              </div>
              <button onClick={handleSendOTP} disabled={loading || phone.length < 10} className="btn-primary w-full disabled:opacity-50">
                {loading ? <Spinner /> : <>Send OTP <HiArrowRight className="h-4 w-4" /></>}
              </button>
            </div>
          )}

          {method === "phone" && phoneStep === "otp" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-nepal-forest/5 p-3 text-center">
                <p className="text-xs text-gray-500">Code sent to</p>
                <p className="text-sm font-semibold text-nepal-slate">+977 {formatNepalPhone(phone)}</p>
                <p className="text-[10px] text-nepal-forest">{getOperator(phone)}</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-nepal-slate">Enter 6-digit OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="● ● ● ● ● ●"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); if (errors.otp) clearErrors(); }}
                  className={`input-field text-center text-xl tracking-[0.6em] font-mono ${errors.otp ? "border-red-400" : ""}`}
                  maxLength={6}
                  autoFocus
                />
                {errors.otp && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <HiExclamationCircle className="h-3.5 w-3.5" /> {errors.otp}
                  </p>
                )}
              </div>
              <button onClick={handleVerifyOTP} disabled={loading || otp.length < 6} className="btn-primary w-full disabled:opacity-50">
                {loading ? <Spinner /> : "Verify & Login"}
              </button>
              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={handleResendOTP}
                  disabled={otpTimer > 0}
                  className={`flex items-center gap-1 ${otpTimer > 0 ? "text-gray-400" : "text-nepal-crimson hover:underline"}`}
                >
                  <HiRefresh className="h-3.5 w-3.5" />
                  {otpTimer > 0 ? `Resend in ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, "0")}` : "Resend OTP"}
                </button>
                <button onClick={() => { setPhoneStep("enter"); setOtp(""); clearErrors(); }} className="text-gray-500 hover:text-nepal-slate">
                  Change number
                </button>
              </div>
            </div>
          )}

          {/* ========== EMAIL LOGIN ========== */}
          {method === "email" && emailStep === "enter" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-nepal-slate">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (errors.email) { const err = getEmailError(e.target.value); if (!err) setErrors((p) => { const { email: _, ...r } = p; return r; }); } }}
                    className={`input-field ${errors.email ? "border-red-400" : ""}`}
                  />
                  {email && isValidEmail(email) && (
                    <HiCheckCircle className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-nepal-forest" />
                  )}
                </div>
                {errors.email && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <HiExclamationCircle className="h-3.5 w-3.5" /> {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-nepal-slate">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (errors.password) { const err = getPasswordError(e.target.value); if (!err) setErrors((p) => { const { password: _, ...r } = p; return r; }); } }}
                    className={`input-field pr-10 ${errors.password ? "border-red-400" : ""}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-nepal-slate">
                    {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <HiExclamationCircle className="h-3.5 w-3.5" /> {errors.password}
                  </p>
                )}
              </div>
              <button onClick={handleEmailLogin} disabled={loading} className="btn-primary w-full disabled:opacity-50">
                {loading ? <Spinner /> : <>Continue <HiArrowRight className="h-4 w-4" /></>}
              </button>
              <button onClick={() => toast("Password reset will be available once Supabase is connected", { icon: "🔗" })} className="w-full text-center text-xs text-nepal-crimson hover:underline">
                Forgot password?
              </button>
            </div>
          )}

          {method === "email" && emailStep === "verify" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-nepal-forest/5 p-3 text-center">
                <p className="text-xs text-gray-500">Verification code sent to</p>
                <p className="text-sm font-semibold text-nepal-slate">{email}</p>
                <p className="text-[10px] text-gray-400">Check your inbox and spam folder</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-nepal-slate">Enter 6-digit code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="● ● ● ● ● ●"
                  value={emailCode}
                  onChange={(e) => { setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6)); if (errors.emailCode) clearErrors(); }}
                  className={`input-field text-center text-xl tracking-[0.6em] font-mono ${errors.emailCode ? "border-red-400" : ""}`}
                  maxLength={6}
                  autoFocus
                />
                {errors.emailCode && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <HiExclamationCircle className="h-3.5 w-3.5" /> {errors.emailCode}
                  </p>
                )}
              </div>
              <button onClick={handleVerifyEmailCode} disabled={loading || emailCode.length < 6} className="btn-primary w-full disabled:opacity-50">
                {loading ? <Spinner /> : "Verify & Login"}
              </button>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  {emailTimer > 0 ? `Code expires in ${Math.floor(emailTimer / 60)}:${(emailTimer % 60).toString().padStart(2, "0")}` : "Code expired"}
                </span>
                <button onClick={() => { setEmailStep("enter"); setEmailCode(""); clearErrors(); }} className="text-gray-500 hover:text-nepal-slate">
                  Change email
                </button>
              </div>
            </div>
          )}

          <div className="mandala-divider my-6"><span className="bg-white px-3 text-xs text-gray-400">or</span></div>

          <button onClick={handleGoogleLogin} className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 py-3 text-sm font-medium text-nepal-slate transition-all hover:bg-gray-50 active:scale-[0.98]">
            <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-semibold text-nepal-crimson hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />;
}
