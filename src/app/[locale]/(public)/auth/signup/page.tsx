"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeftIcon, EyeIcon, SlashIcon, Rocket, Clock, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

// ============================================================
// 🔧 TOGGLE: Set to `true` to show waitlist, `false` to enable signup
// ============================================================
const WAITLIST_MODE = true;
// ============================================================

const WAITLIST_URL = "https://pagespilot.com/#waitlist";

function WaitlistView({ isRTL, t }: { isRTL: boolean; t: ReturnType<typeof import("next-intl").useTranslations<"HomePage">> }) {
  return (
    <div
      className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <Rocket className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">
            {t("signup.waitlist.heading")}
          </h2>
          <p className="mt-2 text-slate-600">
            {t("signup.waitlist.description")}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-5">
          {/* Badge */}
          <div className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-amber-800 text-sm font-medium">
              {t("signup.waitlist.inviteOnly")}
            </span>
          </div>

          <p className="text-slate-600 text-sm text-center">
            {t("signup.waitlist.ctaDescription")}
          </p>

          <a
            href={WAITLIST_URL}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            {t("signup.waitlist.joinButton")}
            <ArrowRight className="w-4 h-4" />
          </a>

          <div className="text-center">
            <span className="text-slate-500 text-xs">{t("signup.waitlist.haveInvite")} </span>
            <Link
              href="/auth/login"
              className="text-indigo-600 hover:text-indigo-700 font-medium text-xs"
            >
              {t("signup.waitlist.signInHere")}
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 me-2" />
            {t("signup.waitlist.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const t = useTranslations("HomePage");
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading, signup } = useAuth();
  const locale = params.locale as string;
  const isRTL = locale === "ar";

  // ─── Redirect to waitlist if WAITLIST_MODE is on ───────────────
  if (WAITLIST_MODE) {
    return <WaitlistView isRTL={isRTL} t={t} />;
  }
  // ───────────────────────────────────────────────────────────────

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated) {
      router.push(`/user/dashboard`);
    }
  }, [isAuthenticated, router, locale]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = t("signup.validation.nameRequired");
    } else if (formData.name.trim().length < 2) {
      errors.name = t("signup.validation.nameMinLength");
    }

    if (!formData.email.trim()) {
      errors.email = t("signup.validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t("signup.validation.emailInvalid");
    }

    if (!formData.password) {
      errors.password = t("signup.validation.passwordRequired");
    } else if (formData.password.length < 8) {
      errors.password = t("signup.validation.passwordMinLength");
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = t("signup.validation.passwordComplexity");
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = t("signup.validation.confirmPasswordRequired");
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t("signup.validation.passwordMismatch");
    }

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = t("signup.validation.termsRequired");
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await signup(formData.name.trim(), formData.email.trim(), formData.password);
      router.push(`/auth/login?message=signup-success`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("signup.signupFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">{t("signup.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <Rocket className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">{t("signup.title")}</h2>
          <p className="mt-2 text-slate-600">{t("signup.subtitle")}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="w-5 h-5 text-red-500 me-3">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                    </svg>
                  </div>
                  <span className="text-red-800 text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t("signup.nameLabel")}</label>
                <input
                  type="text" name="name" required value={formData.name} onChange={handleChange}
                  placeholder={t("signup.namePlaceholder")}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 hover:border-slate-400 ${validationErrors.name ? "border-red-300 focus:ring-red-500" : "border-slate-300"}`}
                />
                {validationErrors.name && <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t("signup.emailLabel")}</label>
                <input
                  type="email" name="email" required value={formData.email} onChange={handleChange}
                  placeholder={t("signup.emailPlaceholder")}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 hover:border-slate-400 ${validationErrors.email ? "border-red-300 focus:ring-red-500" : "border-slate-300"}`}
                />
                {validationErrors.email && <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t("signup.passwordLabel")}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} name="password" required
                    value={formData.password} onChange={handleChange}
                    placeholder={t("signup.passwordPlaceholder")}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 hover:border-slate-400 ${validationErrors.password ? "border-red-300 focus:ring-red-500" : "border-slate-300"}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg transition-colors">
                    {showPassword ? <SlashIcon className="w-5 h-5 text-slate-500" /> : <EyeIcon className="w-5 h-5 text-slate-500" />}
                  </button>
                </div>
                {validationErrors.password && <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t("signup.confirmPasswordLabel")}</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"} name="confirmPassword" required
                    value={formData.confirmPassword} onChange={handleChange}
                    placeholder={t("signup.confirmPasswordPlaceholder")}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 hover:border-slate-400 ${validationErrors.confirmPassword ? "border-red-300 focus:ring-red-500" : "border-slate-300"}`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute end-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg transition-colors">
                    {showConfirmPassword ? <SlashIcon className="w-5 h-5 text-slate-500" /> : <EyeIcon className="w-5 h-5 text-slate-500" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>}
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange}
                className={`w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 mt-1 ${validationErrors.agreeToTerms ? "border-red-300" : ""}`}
              />
              <div className="ms-3">
                <span className="text-sm text-slate-600">
                  {t("signup.agreeToTerms")}{" "}
                  <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">{t("signup.termsOfService")}</a>{" "}
                  {t("signup.and")}{" "}
                  <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">{t("signup.privacyPolicy")}</a>
                </span>
                {validationErrors.agreeToTerms && <p className="mt-1 text-sm text-red-600">{validationErrors.agreeToTerms}</p>}
              </div>
            </div>

            <button
              type="submit" disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin me-3" />{t("signup.creatingAccount")}</>
              ) : t("signup.signupButton")}
            </button>

            <div className="text-center">
              <span className="text-slate-600 text-sm">{t("signup.haveAccount")} </span>
              <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                {t("signup.signIn")}
              </Link>
            </div>
          </form>
        </div>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">
            <ArrowLeftIcon className="w-4 h-4 me-2" />
            {t("login.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}