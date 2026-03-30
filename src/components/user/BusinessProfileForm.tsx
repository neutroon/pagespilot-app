"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Pencil,
  Phone,
  Clock,
  MapPin,
  Briefcase,
  Target,
  User,
  ShieldCheck,
  HelpCircle,
  Plus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Database,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FaqItem {
  question: string;
  answer: string;
  isOpen: boolean;
  isEditing: boolean;
}

export interface BusinessProfileFormData {
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

interface BusinessProfileFormProps {
  formData: BusinessProfileFormData;
  onChange: (data: BusinessProfileFormData) => void;
  isSaving: boolean;
  error: string | null;
  onSave: () => void;
  ragToast: boolean;
  onDismissRagToast: () => void;
  submitLabel?: string;
  submitIcon?: React.ReactNode;
}

// ─── Utility Components ───────────────────────────────────────────────────────

function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
    }
    setInput("");
  };

  const removeTag = (idx: number) => {
    onChange(tags.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-sm font-medium group"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="ml-1 text-indigo-400 hover:text-indigo-700 transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {tags.length === 0 && (
          <span className="text-sm text-gray-400 italic">No items yet</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-gray-50 transition"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  delay,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="ob-section bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
          {icon}
        </div>
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-600 mb-1.5">
      {children}
    </label>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BusinessProfileForm({
  formData,
  onChange,
  isSaving,
  error,
  onSave,
  ragToast,
  onDismissRagToast,
  submitLabel = "Save Profile",
  submitIcon = <CheckCircle className="w-5 h-5" />,
}: BusinessProfileFormProps) {
  // Auto-dismiss RAG toast
  useEffect(() => {
    if (!ragToast) return;
    const t = setTimeout(() => onDismissRagToast(), 3000);
    return () => clearTimeout(t);
  }, [ragToast, onDismissRagToast]);

  const updateField = (key: keyof BusinessProfileFormData, value: unknown) => {
    onChange({ ...formData, [key]: value });
  };

  const toggleFaq = (idx: number) => {
    onChange({
      ...formData,
      faqs: formData.faqs.map((f, i) =>
        i === idx ? { ...f, isOpen: !f.isOpen } : f
      ),
    });
  };

  const editFaq = (idx: number, field: "question" | "answer", value: string) => {
    onChange({
      ...formData,
      faqs: formData.faqs.map((f, i) =>
        i === idx ? { ...f, [field]: value } : f
      ),
    });
  };

  const removeFaq = (idx: number) => {
    onChange({
      ...formData,
      faqs: formData.faqs.filter((_, i) => i !== idx),
    });
  };

  const addFaq = () => {
    onChange({
      ...formData,
      faqs: [
        ...formData.faqs,
        { question: "", answer: "", isOpen: true, isEditing: true },
      ],
    });
  };

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

      <div className="space-y-6">
        {/* 1 · Business Overview */}
        <SectionCard icon={<Briefcase className="w-5 h-5" />} title="Business Overview" delay={100}>
          <div>
            <FieldLabel>Business Name</FieldLabel>
            <input
              type="text"
              className="ob-input"
              value={formData.business_name}
              onChange={(e) => updateField("business_name", e.target.value)}
              placeholder="Your business name"
            />
          </div>
          <div>
            <FieldLabel>Brand Identity</FieldLabel>
            <textarea
              className="ob-textarea"
              rows={4}
              value={formData.brand_identity}
              onChange={(e) => updateField("brand_identity", e.target.value)}
              placeholder="Describe your brand, mission, and what makes you unique…"
            />
          </div>
        </SectionCard>

        {/* 2 · Audience */}
        <SectionCard icon={<Target className="w-5 h-5" />} title="Your Audience" delay={180}>
          <div>
            <FieldLabel>Target Audience</FieldLabel>
            <textarea
              className="ob-textarea"
              rows={3}
              value={formData.target_audience}
              onChange={(e) => updateField("target_audience", e.target.value)}
              placeholder="Who are your ideal customers? Demographics, interests, pain points…"
            />
          </div>
          <div>
            <FieldLabel>Voice &amp; Tone</FieldLabel>
            <div className="relative">
              <select
                className="ob-select"
                value={formData.voice_and_tone}
                onChange={(e) => updateField("voice_and_tone", e.target.value)}
              >
                {["Professional", "Friendly", "Playful", "Authoritative", "Casual", "Inspirational"].map(
                  (v) => <option key={v}>{v}</option>
                )}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </SectionCard>

        {/* 3 · Products & Services */}
        <SectionCard icon={<Briefcase className="w-5 h-5" />} title="Products &amp; Services" delay={260}>
          <TagInput
            tags={formData.products_services}
            onChange={(tags) => updateField("products_services", tags)}
            placeholder="Add a product or service…"
          />
        </SectionCard>

        {/* 4 · User Intents */}
        <SectionCard icon={<User className="w-5 h-5" />} title="Expected User Intents" delay={340}>
          <p className="text-xs text-gray-400 -mt-2 mb-2">
            What goals or questions do your visitors typically have?
          </p>
          <TagInput
            tags={formData.expected_user_intents}
            onChange={(tags) => updateField("expected_user_intents", tags)}
            placeholder="e.g. Book an appointment, Get a quote…"
          />
        </SectionCard>

        {/* 5 · Contact & Hours */}
        <SectionCard icon={<Phone className="w-5 h-5" />} title="Contact &amp; Hours" delay={420}>
          <div>
            <FieldLabel>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Phone Numbers
              </span>
            </FieldLabel>
            <TagInput
              tags={formData.phone_numbers}
              onChange={(tags) => updateField("phone_numbers", tags)}
              placeholder="+1 555 000 0000"
            />
          </div>
          <div>
            <FieldLabel>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Working Hours
              </span>
            </FieldLabel>
            <input
              type="text"
              className="ob-input"
              value={formData.working_hours}
              onChange={(e) => updateField("working_hours", e.target.value)}
              placeholder="e.g. Mon–Fri 9 AM – 6 PM"
            />
          </div>
          <div>
            <FieldLabel>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Address
              </span>
            </FieldLabel>
            <textarea
              className="ob-textarea"
              rows={2}
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Full business address"
            />
          </div>
        </SectionCard>

        {/* 6 · Policies */}
        <SectionCard icon={<ShieldCheck className="w-5 h-5" />} title="Core Policies" delay={500}>
          <textarea
            className="ob-textarea"
            rows={5}
            value={formData.core_policies}
            onChange={(e) => updateField("core_policies", e.target.value)}
            placeholder="Return policy, privacy policy, terms of service highlights…"
          />
        </SectionCard>

        {/* 7 · FAQs */}
        <SectionCard icon={<HelpCircle className="w-5 h-5" />} title="FAQs" delay={580}>
          {formData.faqs.length === 0 && (
            <p className="text-sm text-gray-400 italic">No FAQs extracted — add them manually below.</p>
          )}

          <div className="space-y-3">
            {formData.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50"
              >
                {/* FAQ Header */}
                <div
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleFaq(idx)}
                >
                  <MessageSquare className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    {faq.isEditing || faq.question === "" ? (
                      <input
                        type="text"
                        className="ob-input text-sm font-medium"
                        value={faq.question}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => editFaq(idx, "question", e.target.value)}
                        placeholder="FAQ question…"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-800 truncate">{faq.question}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange({
                          ...formData,
                          faqs: formData.faqs.map((f, i) =>
                            i === idx ? { ...f, isEditing: !f.isEditing, isOpen: true } : f
                          ),
                        });
                      }}
                      className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
                      aria-label="Edit FAQ"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFaq(idx); }}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      aria-label="Remove FAQ"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {faq.isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* FAQ Answer */}
                {faq.isOpen && (
                  <div className="px-4 pb-3 border-t border-gray-200">
                    <textarea
                      className="ob-textarea mt-2"
                      rows={3}
                      value={faq.answer}
                      onChange={(e) => editFaq(idx, "answer", e.target.value)}
                      placeholder="Answer…"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addFaq}
            className="mt-2 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add FAQ
          </button>
        </SectionCard>

        {/* Submit */}
        <div className="ob-section pt-2" style={{ animationDelay: "660ms" }}>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}
          
          <button
            onClick={onSave}
            disabled={isSaving}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              submitIcon
            )}
            {submitLabel}
          </button>
        </div>
      </div>

      {/* RAG Toast */}
      {ragToast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3.5 bg-amber-50 border border-amber-200 rounded-xl shadow-xl text-amber-800 text-sm font-medium z-50 transition-all animate-[fadeInUp_0.3s_ease]">
          <Database className="w-5 h-5 animate-pulse text-amber-500" />
          Knowledge base updating in background…
          <button 
            onClick={onDismissRagToast}
            className="ml-2 text-amber-600 hover:text-amber-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
