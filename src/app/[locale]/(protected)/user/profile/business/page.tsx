"use client";

import { useState, useEffect, useRef } from "react";
import {
  businessProfileService,
  //  fireRagIngest
} from "@/lib/business-profile-api";
import { onboardingService, OnboardingResponse } from "@/lib/onboarding-api";
import BusinessProfileForm, { BusinessProfileFormData } from "@/components/user/BusinessProfileForm";
import { ArrowLeft, Globe, Plus, Loader2, Edit2, Zap, CheckCircle } from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────────────

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

// ─── Sub-Components ─────────────────────────────────────────────────────────

function ProfileSummaryCard({ profile, onEdit }: { profile: { name: string; identity: string; facebookPages: { pageId: string }[] }; onEdit: () => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col transition-all hover:shadow-md hover:border-indigo-200 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1" title={profile.name}>
            {profile.name || "Untitled Profile"}
          </h3>
          <p className="text-sm text-slate-500 mt-2 line-clamp-2 min-h-[40px]">
            {profile.identity || "No brand identity defined."}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
        <div className="flex items-center">
          {profile.facebookPages.length > 0 ? (
            // <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            //   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            //   Connected
            // </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {profile.facebookPages.length} page{profile.facebookPages.length > 1 ? "s" : ""} connected
            </span>


          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-slate-100 text-slate-500 border border-slate-200">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
              Not Connected
            </span>
          )}
        </div>
        <button
          onClick={onEdit}
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Edit Profile"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ProfileEditor({
  initialProfile,
  onSaveSuccess,
  onBack
}: {
  initialProfile: any | null;
  onSaveSuccess?: () => void;
  onBack: () => void;
}) {
  const [bizData, setBizData] = useState<BusinessProfileFormData | null>(null);
  const [isBizSaving, setIsBizSaving] = useState(false);
  const [bizError, setBizError] = useState<string | null>(null);
  const [ragToast, setRagToast] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Scraper State
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);

  const msgRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialProfile) {
      setBizData({
        business_name: initialProfile.name || "",
        brand_identity: initialProfile.identity || "",
        target_audience: initialProfile.targetAudience || "",
        voice_and_tone: initialProfile.voiceAndTone || "Professional",
        products_services: initialProfile.productsServices || [],
        expected_user_intents: initialProfile.expectedUserIntents || [],
        phone_numbers: initialProfile.phoneNumbers || [],
        working_hours: initialProfile.workingHours || "",
        address: initialProfile.address || "",
        core_policies: initialProfile.corePolicies || "",
        faqs: (initialProfile.faqs || []).map((f: any) => ({ ...f, isOpen: false, isEditing: false })),
      });
    } else {
      setBizData({
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
    }
  }, [initialProfile]);

  useEffect(() => {
    if (!isScraping) return;
    msgRef.current = setInterval(() => {
      setLoadingMsg((m) => (m + 1) % LOADING_MESSAGES.length);
    }, 4500);
    return () => clearInterval(msgRef.current!);
  }, [isScraping]);

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
    setBizError(null);
    setSuccessMsg(null);
    setIsScraping(true);

    try {
      const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      const res: OnboardingResponse = await onboardingService.analyzeWebsite(normalized);

      const d = res.data;
      setBizData({
        business_name: d.business_name || bizData?.business_name || "",
        brand_identity: d.brand_identity || bizData?.brand_identity || "",
        target_audience: d.target_audience || bizData?.target_audience || "",
        voice_and_tone: d.voice_and_tone || bizData?.voice_and_tone || "Professional",
        products_services: Array.isArray(d.products_services) && d.products_services.length ? d.products_services : (bizData?.products_services || []),
        expected_user_intents: Array.isArray(d.expected_user_intents) && d.expected_user_intents.length ? d.expected_user_intents : (bizData?.expected_user_intents || []),
        phone_numbers: Array.isArray(d.contact_and_hours?.phone_numbers) && d.contact_and_hours.phone_numbers.length ? d.contact_and_hours.phone_numbers : (bizData?.phone_numbers || []),
        working_hours: d.contact_and_hours?.working_hours || bizData?.working_hours || "",
        address: d.contact_and_hours?.address || bizData?.address || "",
        core_policies: d.core_policies || bizData?.core_policies || "",
        faqs: Array.isArray(d.faqs) && d.faqs.length
          ? d.faqs.map((f: any) => ({ ...f, isOpen: false, isEditing: false }))
          : (bizData?.faqs || []),
      });
      setSuccessMsg("Website data imported successfully! Review the extracted fields below before saving.");
    } catch (err) {
      setBizError("Something went wrong while analyzing your website. Please try filling the form manually.");
    } finally {
      setIsScraping(false);
    }
  };

  const handleBizSave = async () => {
    if (!bizData) return;
    setIsBizSaving(true);
    setBizError(null);
    setSuccessMsg(null);

    try {
      const payload: any = {
        name: bizData.business_name,
        identity: bizData.brand_identity,
        targetAudience: bizData.target_audience,
        voiceAndTone: bizData.voice_and_tone,
        productsServices: bizData.products_services,
        expectedUserIntents: bizData.expected_user_intents,
        phoneNumbers: bizData.phone_numbers,
        workingHours: bizData.working_hours,
        address: bizData.address,
        corePolicies: bizData.core_policies,
        faqs: bizData.faqs.map((f: any) => ({
          question: f.question,
          answer: f.answer,
        })),
      };
      if (initialProfile?.id) { payload.id = initialProfile.id; }


      const savedProfile = await businessProfileService.save(payload);
      // fireRagIngest(savedProfile.id);
      setRagToast(true);
      setSuccessMsg("Business profile saved successfully!");
      if (onSaveSuccess) onSaveSuccess();
    } catch (error) {
      setBizError(
        error instanceof Error ? error.message : "Failed to save business profile"
      );
    } finally {
      setIsBizSaving(false);
    }
  };

  if (!bizData) return null;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
      {/* ─── Header & Back Navigation ─── */}
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={onBack}
          className="p-2 bg-white text-slate-500 hover:text-slate-800 rounded-full border border-slate-200 shadow-sm transition-all hover:bg-slate-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {initialProfile ? `Configure: ${initialProfile.name}` : "Create New Business Profile"}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Design the behavior, persona, and knowledge base of your chatbot
          </p>
        </div>
      </div>

      {/* ─── Intelligent Scraper Section ─── */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Globe className="w-24 h-24 text-indigo-600" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-indigo-900">Start with AI Website Scrape</h3>
          </div>
          <p className="text-sm text-indigo-700/80 mb-5 max-w-2xl">
            Save time by letting our AI read your website. We'll automatically identify your brand identity, extract your FAQs, and prepare the core configurations.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-indigo-400" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-website.com"
                className={`block w-full pl-10 pr-3 py-3 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${urlError ? "border-red-300 bg-red-50 focus:border-red-500" : "border-indigo-200 bg-white focus:border-indigo-500"
                  }`}
                disabled={isScraping}
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isScraping || !url.trim()}
              className="flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all whitespace-nowrap"
            >
              {isScraping ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  Analyzing
                </>
              ) : (
                "Analyze Website"
              )}
            </button>
          </div>
          {urlError && <p className="mt-2 text-sm text-red-600 font-medium">{urlError}</p>}

          {/* Scraping Status Overlay */}
          {isScraping && (
            <div className="mt-4 p-4 rounded-xl bg-white/60 backdrop-blur border border-indigo-100/50 flex items-center space-x-3 text-indigo-800 font-medium animate-[fadeIn_0.5s_ease]">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span>{LOADING_MESSAGES[loadingMsg]}</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Feedback Banners ─── */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          {successMsg}
        </div>
      )}

      {/* ─── Full Form ─── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <BusinessProfileForm
          formData={bizData}
          onChange={setBizData}
          isSaving={isBizSaving}
          error={bizError}
          onSave={handleBizSave}
          ragToast={ragToast}
          onDismissRagToast={() => setRagToast(false)}
          submitLabel={initialProfile ? "Update Business Profile" : "Create Business Profile"}
        />
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

type ViewState = "list" | "edit" | "new";

export default function BusinessProfilesPage() {
  const [view, setView] = useState<ViewState>("list");
  const [activeProfile, setActiveProfile] = useState<any | null>(null);

  const [bizProfiles, setBizProfiles] = useState<any[]>([]);
  const [isProfilesLoading, setIsProfilesLoading] = useState(true);

  const loadProfiles = () => {
    setIsProfilesLoading(true);
    businessProfileService.getAll().then((bps) => {
      setBizProfiles(bps);
      setIsProfilesLoading(false);

      // If we are editing and just saved, we might want to stay in edit mode
      // or if we created a new one, we can go back to list
      // For now, let's just remain in the same view.
    }).catch(() => {
      setBizProfiles([]);
      setIsProfilesLoading(false);
    });
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleEdit = (profile: any) => {
    setActiveProfile(profile);
    setView("edit");
  };

  const handleCreateNew = () => {
    setActiveProfile(null);
    setView("new");
  };

  const handleBackToList = () => {
    setActiveProfile(null);
    setView("list");
  };

  // Render Editor Mode
  if (view === "edit" || view === "new") {
    return (
      <ProfileEditor
        initialProfile={activeProfile}
        onSaveSuccess={() => { loadProfiles(); handleBackToList(); }}
        onBack={handleBackToList}
      />
    );
  }

  // Render List Mode
  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
      {/* List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Your Business Profiles</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your chatbots, knowledge bases, and conversational configurations
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Profile
        </button>
      </div>

      {isProfilesLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bizProfiles.map((bp) => (
            <ProfileSummaryCard
              key={bp.id}
              profile={bp}
              onEdit={() => handleEdit(bp)}
            />
          ))}

          {/* Prompt card if array is empty */}
          {bizProfiles.length === 0 && (
            <div
              onClick={handleCreateNew}
              className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-colors group min-h-[180px]"
            >
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Create your first profile</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-[200px]">
                We'll use your website URL to auto-generate everything you need.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
