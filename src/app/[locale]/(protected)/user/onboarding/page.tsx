"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  onboardingService,
  OnboardingResponse,
} from "@/lib/onboarding-api";
import {
  businessProfileService,
  fireRagIngest,
} from "@/lib/business-profile-api";
import AppNavbar from "@/components/shared/AppNavbar";
import BusinessProfileForm, { BusinessProfileFormData } from "@/components/user/BusinessProfileForm";
import {
  Globe,
  Sparkles,
  ArrowRight,
  Plus,
  X,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Pencil,
  Phone,
  Clock,
  MapPin,
  User,
  Target,
  Briefcase,
  MessageSquare,
  ShieldCheck,
  HelpCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = "url" | "loading" | "form";

interface FaqItem {
  question: string;
  answer: string;
  isOpen: boolean;
  isEditing: boolean;
}

interface FormData {
  business_name: string;
  brand_identity: string;
  target_audience: string;
  voice_and_tone: string;
  products_services: string[];
  expected_user_intents: string[];
  phone_numbers: string[];
  working_hours: string;
  address: string;
  core_policies: string;
  faqs: FaqItem[];
}

// ─── Loading Messages ─────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  "🌐 Visiting your website…",
  "🔍 Reading your content…",
  "🎯 Understanding your brand…",
  "👥 Analyzing your audience…",
  "📦 Discovering your products…",
  "💬 Learning your voice & tone…",
  "📋 Extracting policies & FAQs…",
  "✨ Polishing your profile…",
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [step, setStep] = useState<Step>("url");
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  
  // Save State
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [ragToast, setRagToast] = useState(false);

  const [formData, setFormData] = useState<BusinessProfileFormData>({
    business_name: "",
    brand_identity: "",
    target_audience: "",
    voice_and_tone: "Professional",
    products_services: [],
    expected_user_intents: [],
    phone_numbers: [],
    working_hours: "",
    address: "",
    core_policies: "",
    faqs: [],
  });

  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const msgRef = useRef<NodeJS.Timeout | null>(null);

  // Rotate loading messages
  useEffect(() => {
    if (step !== "loading") return;
    msgRef.current = setInterval(() => {
      setLoadingMsg((m) => (m + 1) % LOADING_MESSAGES.length);
    }, 5000);
    return () => clearInterval(msgRef.current!);
  }, [step]);

  // Animate progress bar (fills over ~60s, slows near 90%)
  useEffect(() => {
    if (step !== "loading") return;
    setProgress(0);
    const start = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      // Ease-out formula: fast start, slow near end
      const p = Math.min(92, (elapsed / 60) * 100 * 1.15);
      setProgress(p);
    }, 500);
    return () => clearInterval(progressRef.current!);
  }, [step]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const validateUrl = (value: string) => {
    try {
      const u = new URL(value.startsWith("http") ? value : `https://${value}`);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return false;
    }
  };

  const handleAnalyze = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError("Please enter your website URL");
      return;
    }
    if (!validateUrl(trimmed)) {
      setUrlError("Please enter a valid URL (e.g. https://yoursite.com)");
      return;
    }
    setUrlError("");
    setStep("loading");

    try {
      const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      const res: OnboardingResponse = await onboardingService.analyzeWebsite(normalized);

      // Fill form from API response
      const d = res.data;
      setFormData({
        business_name: d.business_name || "",
        brand_identity: d.brand_identity || "",
        target_audience: d.target_audience || "",
        voice_and_tone: d.voice_and_tone || "Professional",
        products_services: Array.isArray(d.products_services) ? d.products_services : [],
        expected_user_intents: Array.isArray(d.expected_user_intents) ? d.expected_user_intents : [],
        phone_numbers: Array.isArray(d.contact_and_hours?.phone_numbers) ? d.contact_and_hours.phone_numbers : [],
        working_hours: d.contact_and_hours?.working_hours || "",
        address: d.contact_and_hours?.address || "",
        core_policies: d.core_policies || "",
        faqs: Array.isArray(d.faqs)
          ? d.faqs.map((f) => ({ ...f, isOpen: false, isEditing: false }))
          : [],
      });

      clearInterval(progressRef.current!);
      setProgress(100);
      setTimeout(() => setStep("form"), 600);
    } catch (err) {
      clearInterval(progressRef.current!);
      setStep("url");
      setUrlError("Something went wrong while analyzing your website. Please try again.");
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const payload = {
        name: formData.business_name,
        identity: formData.brand_identity,
        targetAudience: formData.target_audience,
        voiceAndTone: formData.voice_and_tone,
        productsServices: formData.products_services,
        expectedUserIntents: formData.expected_user_intents,
        phoneNumbers: formData.phone_numbers,
        workingHours: formData.working_hours,
        address: formData.address,
        corePolicies: formData.core_policies,
        faqs: formData.faqs.map(f => ({ question: f.question, answer: f.answer })),
      };

      const savedProfile = await businessProfileService.save(payload);
      
      // Fire and forget RAG ingestion
      fireRagIngest(savedProfile.id);
      setRagToast(true);

      setToast({ type: "success", msg: "Profile saved! Taking you to the dashboard…" });
      setTimeout(() => router.push(`/${locale}/user/dashboard`), 1800);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render: URL Step ─────────────────────────────────────────────────────
  if (step === "url") {
    return (
      <>
        <style>{`
          @keyframes floatUp {
            0% { opacity: 0; transform: translateY(28px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .float-up { animation: floatUp 0.6s ease forwards; }
          .float-up-1 { animation: floatUp 0.6s 0.1s ease forwards; opacity: 0; }
          .float-up-2 { animation: floatUp 0.6s 0.25s ease forwards; opacity: 0; }
          .float-up-3 { animation: floatUp 0.6s 0.4s ease forwards; opacity: 0; }

          @keyframes pulse-ring {
            0% { transform: scale(0.9); opacity: 0.6; }
            70% { transform: scale(1.15); opacity: 0.0; }
            100% { transform: scale(0.9); opacity: 0; }
          }
          .pulse-ring::after {
            content: '';
            position: absolute;
            inset: -6px;
            border-radius: 9999px;
            border: 2px solid #6366f1;
            animation: pulse-ring 2s ease-out infinite;
          }
        `}</style>

        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center px-4 relative overflow-hidden">
          {/* Background orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-full max-w-lg text-center">
            {/* Logo badge */}
            <div className="float-up inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-indigo-300 mb-8 backdrop-blur">
              <Sparkles className="w-4 h-4" />
              PagesPilot AI Setup
            </div>

            <h1 className="float-up-1 text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
              Let&rsquo;s set up your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                AI assistant
              </span>
            </h1>

            <p className="float-up-2 text-slate-400 text-lg mb-10 leading-relaxed">
              Enter your website URL. Our AI will scan it and automatically
              build your business profile — ready to edit in seconds.
            </p>

            {/* URL Input */}
            <div className="float-up-3 space-y-3">
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (urlError) setUrlError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  placeholder="https://yourwebsite.com"
                  autoFocus
                  className={`w-full pl-12 pr-4 py-4 bg-white/5 border ${
                    urlError ? "border-red-500/70" : "border-white/10"
                  } rounded-2xl text-white placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60 focus:bg-white/8 backdrop-blur transition`}
                />
              </div>

              {urlError && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {urlError}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/50 hover:shadow-indigo-900/70 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Sparkles className="w-5 h-5" />
                Analyze My Website
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Trust signals */}
            <div className="mt-8 flex items-center justify-center gap-6 text-slate-500 text-sm">
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-indigo-500" /> Takes ~1 minute</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-indigo-500" /> AI-powered</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-indigo-500" /> Fully editable</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Render: Loading Step ──────────────────────────────────────────────────
  if (step === "loading") {
    return (
      <>
        <style>{`
          @keyframes spin-slow { to { transform: rotate(360deg); } }
          @keyframes spin-rev  { to { transform: rotate(-360deg); } }
          @keyframes fadeMsg   { 0%,100%{opacity:0;transform:translateY(8px)} 15%,85%{opacity:1;transform:translateY(0)} }
          .ring-outer { animation: spin-slow 3s linear infinite; }
          .ring-inner { animation: spin-rev 2s linear infinite; }
          .msg-fade   { animation: fadeMsg 5s ease infinite; }
        `}</style>

        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center px-4">
          <div className="text-center max-w-sm">
            {/* Orbital Spinner */}
            <div className="relative w-32 h-32 mx-auto mb-10">
              {/* Outer ring */}
              <div className="ring-outer absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 border-r-indigo-500/30" />
              {/* Mid ring */}
              <div className="ring-inner absolute inset-3 rounded-full border-2 border-transparent border-b-purple-400 border-l-purple-400/30" />
              {/* Core */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-900/60">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              Analyzing your website
            </h2>

            {/* Rotating message */}
            <div className="h-8 overflow-hidden mb-8">
              <p key={loadingMsg} className="msg-fade text-indigo-300 text-sm">
                {LOADING_MESSAGES[loadingMsg]}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/10 rounded-full h-2 mb-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-500 text-xs">
              This usually takes about 60 seconds — please don&rsquo;t close this tab
            </p>

            {/* URL badge */}
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-slate-400 text-sm">
              <Globe className="w-4 h-4" />
              <span className="max-w-xs truncate">{url}</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Render: Form Step ─────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ob-section {
          opacity: 0;
          animation: fadeInUp 0.5s ease forwards;
        }
        .ob-banner { animation: fadeInUp 0.4s ease forwards; }

        .ob-textarea {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          color: #1f2937;
          background: #f9fafb;
          resize: vertical;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
          line-height: 1.6;
        }
        .ob-textarea:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
          background: #fff;
        }
        .ob-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          color: #1f2937;
          background: #f9fafb;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
        }
        .ob-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
          background: #fff;
        }
        .ob-select {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          color: #1f2937;
          background: #f9fafb;
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s;
          appearance: none;
        }
        .ob-select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
          background: #fff;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        <AppNavbar />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

          {/* Success banner */}
          <div className="ob-banner mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold mb-1">
                  Your business profile is ready! ✨
                </h1>
                <p className="text-indigo-100 text-sm leading-relaxed">
                  We&rsquo;ve pre-filled everything from{" "}
                  <span className="font-semibold text-white">{url}</span>.
                  Review each section, make any corrections, then complete your setup.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <BusinessProfileForm
            formData={formData}
            onChange={setFormData}
            isSaving={isSaving}
            error={saveError}
            onSave={handleSubmit}
            ragToast={ragToast}
            onDismissRagToast={() => setRagToast(false)}
            submitLabel="Complete Setup"
          />
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium z-50 transition-all animate-[fadeInUp_0.3s_ease] ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {toast.msg}
        </div>
      )}
    </>
  );
}
