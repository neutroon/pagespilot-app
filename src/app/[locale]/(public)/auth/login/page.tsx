"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeftIcon, EyeIcon, SlashIcon } from "lucide-react";
import Logo from "@/components/shared/Logo";
import { Link } from "@/i18n/navigation";

export default function LoginPage() {
  const t = useTranslations("HomePage");
  const params = useParams();
  const router = useRouter();
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const locale = params.locale as string;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isRTL = locale === "ar";

  useEffect(() => {
    // Only redirect if user is authenticated and not loading
    if (isAuthenticated && !isLoading && user) {
      // Let AuthContext handle role-based redirect
      // This will be handled by the login function in AuthContext
    }

    // Check for signup success message
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("message") === "signup-success") {
      setSuccessMessage(
        "Account created successfully! Please sign in with your credentials."
      );
    }
  }, [isAuthenticated, isLoading, user, router, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await login(formData.email, formData.password);
      // AuthContext will handle the role-based redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
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
            <div className="w-16 h-16 flex items-center justify-center">
              <Logo ariaLabel="PagesPilot Logo" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">
            {t("login.title")}
          </h2>
          <p className="mt-2 text-slate-600">{t("login.subtitle")}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="w-5 h-5 text-green-500 me-3">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      />
                    </svg>
                  </div>
                  <span className="text-green-800 text-sm font-medium">
                    {successMessage}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="w-5 h-5 text-red-500 me-3">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      />
                    </svg>
                  </div>
                  <span className="text-red-800 text-sm font-medium">
                    {error}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("login.emailLabel")}
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("login.emailPlaceholder")}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 hover:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("login.passwordLabel")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t("login.passwordPlaceholder")}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 hover:border-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {showPassword ? (
                      <SlashIcon className="w-5 h-5 text-slate-500" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span className="ms-2 text-sm text-slate-600">
                  {t("login.rememberMe")}
                </span>
              </label>
              <a
                href="#"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {t("login.forgotPassword")}
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin me-3" />
                  {t("login.loggingIn")}
                </>
              ) : (
                t("login.loginButton")
              )}
            </button>

            <div className="text-center">
              <span className="text-slate-600 text-sm">
                {t("login.noAccount")}{" "}
              </span>
              <Link
                href="/auth/signup"
                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              >
                {t("login.signUp")}
              </Link>
            </div>
          </form>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 me-2" />
            {t("login.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
