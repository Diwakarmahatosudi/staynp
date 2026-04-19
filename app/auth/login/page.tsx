"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiPhone,
  HiMail,
  HiArrowRight,
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
  checkRateLimit,
} from "@/lib/validation";
import { api } from "@/lib/api-client";

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
  const [otpTimer, setOtpTimer] = useState(0);

  // Email state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailStep, setEmailStep] = useState<EmailStep>("enter");
  const [emailCode, setEmailCode] = useState("");
  const [emailTimer, setEmailTimer] = useState(0);

  // General
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (otpTimer <= 0) return;
    const id = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [otpTimer]);

  useEffect(() => {
    if (emailTimer <= 0) return;
    const id = setInterval(() => setEmailTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [emailTimer]);

  const clearErrors = useCallback(() => setErrors({}), []);

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
    if (errors.phone) setErrors((p) => ({ ...p, phone: "" }));
  };

  const handleSendOTP = async () => {
    const phoneErr = getPhoneError(phone);
    if (phoneErr) {
      setErrors({ phone: phoneErr });
      return;
    }

    const rl = checkRateLimit("otp-send", 3, 60000);
    if (!rl.allowed) {
      toast.error(`Too many attempts. Try again in ${Math.ceil(rl.retryAfterMs / 1000)}s`);
      return;
    }

    setLoading(true);
    clearErrors();

    const res = await api.auth.sendOtp({ channel: "phone", target: phone, purpose: "login" });
    setLoading(false);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }

    setPhoneStep("otp");
    setOtpTimer(120);

    const operator = getOperator(phone);
    toast.success(`OTP sent to +977 ${formatNepalPhone(phone)} (${operator})`, { duration: 4000 });

    if (res.data.dev_code) {
      console.log(`[DEV] OTP Code: ${res.data.dev_code}`);
      toast(`Dev — OTP: ${res.data.dev_code}`, { icon: "🔑", duration: 12000 });
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setErrors({ otp: "Enter the full 6-digit code" });
      return;
    }

    setLoading(true);
    clearErrors();

    const res = await api.auth.loginWithOtp({ phone, code: otp });
    setLoading(false);

    if (!res.ok) {
      setErrors({ otp: res.error });
      return;
    }

    toast.success("नमस्ते! Welcome back!");
    router.push("/");
    router.refresh();
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0) return;
    setOtp("");
    await handleSendOTP();
  };

  const handleEmailLogin = async () => {
    const newErrors: Record<string, string> = {};
    const emailErr = getEmailError(email);
    if (emailErr) newErrors.email = emailErr;
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const rl = checkRateLimit("email-login", 5, 60000);
    if (!rl.allowed) {
      toast.error(`Too many attempts. Try again in ${Math.ceil(rl.retryAfterMs / 1000)}s`);
      return;
    }

    setLoading(true);
    clearErrors();

    const res = await api.auth.login({ email, password });
    setLoading(false);

    if (!res.ok) {
      // If account not verified, fall back to email OTP
      if (res.status === 401) {
        setErrors({ password: res.error });
      } else {
        toast.error(res.error);
      }
      return;
    }

    toast.success("नमस्ते! Welcome back!");
    router.push("/");
    router.refresh();
  };

  const handleSendEmailCode = async () => {
    const emailErr = getEmailError(email);
    if (emailErr) {
      setErrors({ email: emailErr });
      return;
    }

    setLoading(true);
    clearErrors();
    const res = await api.auth.sendOtp({ channel: "email", target: email, purpose: "login" });
    setLoading(false);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }

    setEmailStep("verify");
    setEmailTimer(300);
    toast.success(`Verification code sent to ${email}`, { duration: 4000 });

    if (res.data.dev_code) {
      console.log(`[DEV] Email Code: ${res.data.dev_code}`);
      toast(`Dev — Code: ${res.data.dev_code}`, { icon: "🔑", duration: 12000 });
    }
  };

  const handleVerifyEmailCode = async () => {
    if (emailCode.length !== 6) {
      setErrors({ emailCode: "Enter the full 6-digit code" });
      return;
    }

    setLoading(true);
    clearErrors();
    const res = await api.auth.loginWithOtp({ email, code: emailCode });
    setLoading(false);

    if (!res.ok) {
      setErrors({ emailCode: res.error });
      return;
    }

    toast.success("नमस्ते! Welcome back!");
    router.push("/");
    router.refresh();
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
          <div className="mb-6 flex rounded-xl bg-nepal-sand p-1">
            {(["phone", "email"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMethod(m)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                  method === m ? "bg-white text-nepal-crimson shadow-sm" : "text-gray-500 hover:text-nepal-slate"
                }`}
              >
                {m === "phone" ? <HiPhone className="h-4 w-4" /> : <HiMail className="h-4 w-4" />}
                {m === "phone" ? "Phone" : "Email"}
              </button>
            ))}
          </div>

          {/* ========== PHONE ========== */}
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
                  <p className="mt-1 text-xs text-nepal-forest">✓ {getOperator(phone)} number detected</p>
                )}
                <p className="mt-1 text-xs text-gray-400">We&apos;ll send a 6-digit OTP via SMS</p>
              </div>
              <button
                onClick={handleSendOTP}
                disabled={loading || phone.length < 10}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? <Spinner /> : (<>Send OTP <HiArrowRight className="h-4 w-4" /></>)}
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
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                    if (errors.otp) clearErrors();
                  }}
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
              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length < 6}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? <Spinner /> : "Verify & Login"}
              </button>
              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={handleResendOTP}
                  disabled={otpTimer > 0}
                  className={`flex items-center gap-1 ${otpTimer > 0 ? "text-gray-400" : "text-nepal-crimson hover:underline"}`}
                >
                  <HiRefresh className="h-3.5 w-3.5" />
                  {otpTimer > 0
                    ? `Resend in ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, "0")}`
                    : "Resend OTP"}
                </button>
                <button
                  onClick={() => {
                    setPhoneStep("enter");
                    setOtp("");
                    clearErrors();
                  }}
                  className="text-gray-500 hover:text-nepal-slate"
                >
                  Change number
                </button>
              </div>
            </div>
          )}

          {/* ========== EMAIL ========== */}
          {method === "email" && emailStep === "enter" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-nepal-slate">Email Address</label>
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
                {errors.password && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <HiExclamationCircle className="h-3.5 w-3.5" /> {errors.password}
                  </p>
                )}
              </div>
              <button onClick={handleEmailLogin} disabled={loading} className="btn-primary w-full disabled:opacity-50">
                {loading ? <Spinner /> : (<>Log in <HiArrowRight className="h-4 w-4" /></>)}
              </button>
              <button
                onClick={handleSendEmailCode}
                disabled={loading || !isValidEmail(email)}
                className="w-full text-center text-xs text-nepal-crimson hover:underline disabled:text-gray-300"
              >
                Log in with email code instead
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
                  onChange={(e) => {
                    setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                    if (errors.emailCode) clearErrors();
                  }}
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
              <button
                onClick={handleVerifyEmailCode}
                disabled={loading || emailCode.length < 6}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? <Spinner /> : "Verify & Login"}
              </button>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  {emailTimer > 0
                    ? `Code expires in ${Math.floor(emailTimer / 60)}:${(emailTimer % 60).toString().padStart(2, "0")}`
                    : "Code expired"}
                </span>
                <button
                  onClick={() => {
                    setEmailStep("enter");
                    setEmailCode("");
                    clearErrors();
                  }}
                  className="text-gray-500 hover:text-nepal-slate"
                >
                  Change email
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-semibold text-nepal-crimson hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />;
}
