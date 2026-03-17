"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FACEBOOK_API } from "@/lib/config";
import { X, Sparkles } from "lucide-react";

interface GeneratePostFormProps {
  onGenerated: (data: {
    content: string;
    hashtags: string[];
    suggestedImage?: string;
    imageUrl?: string;
    imageError?: string;
  }) => void;
  onClose: () => void;
}

export default function GeneratePostForm({
  onGenerated,
  onClose,
}: GeneratePostFormProps) {
  const t = useTranslations("HomePage");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    topic: "",
    tone: "casual",
    length: "medium",
    keywords: "",
    context: "",
    generateImage: true,
  });

  const validTones = [
    "casual",
    "professional",
    "funny",
    "exciting",
    "informative",
  ];

  const validLengths = ["short", "medium", "long"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) {
      setError(t("dashboard.facebook.generateForm.pleaseEnterTopic"));
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const keywords = formData.keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      const requestBody = {
        topic: formData.topic.trim(),
        tone: formData.tone,
        length: formData.length,
        keywords,
        context: formData.context.trim(),
        generateImage: formData.generateImage,
      };

      console.log("=== GENERATING POST ===");
      console.log("Request body:", requestBody);

      const response = await fetch(FACEBOOK_API.GENERATE_POST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("=== GENERATION SUCCESS ===");
        console.log("Generated data:", data);

        onGenerated(data);
      } else {
        const errorData = await response.json();
        console.log("=== GENERATION FAILED ===");
        console.log("Error:", errorData);
        throw new Error(
          errorData.error ||
            t("dashboard.facebook.generateForm.failedToGenerate")
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("dashboard.facebook.generateForm.failedToGenerate")
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Sparkles className="w-5 h-5 me-2 text-purple-600" />
              {t("dashboard.facebook.generateForm.title")}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full me-2"></div>
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("dashboard.facebook.generateForm.topic")} *
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
                placeholder={t(
                  "dashboard.facebook.generateForm.topicPlaceholder"
                )}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
                disabled={isGenerating}
              />
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("dashboard.facebook.generateForm.tone")}
              </label>
              <select
                value={formData.tone}
                onChange={(e) =>
                  setFormData({ ...formData, tone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                disabled={isGenerating}
              >
                {validTones.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("dashboard.facebook.generateForm.length")}
              </label>
              <select
                value={formData.length}
                onChange={(e) =>
                  setFormData({ ...formData, length: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                disabled={isGenerating}
              >
                {validLengths.map((length) => (
                  <option key={length} value={length}>
                    {length.charAt(0).toUpperCase() + length.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("dashboard.facebook.generateForm.keywords")}
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) =>
                  setFormData({ ...formData, keywords: e.target.value })
                }
                placeholder={t(
                  "dashboard.facebook.generateForm.keywordsPlaceholder"
                )}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                disabled={isGenerating}
              />
            </div>

            {/* Context */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("dashboard.facebook.generateForm.context")}
              </label>
              <textarea
                value={formData.context}
                onChange={(e) =>
                  setFormData({ ...formData, context: e.target.value })
                }
                placeholder={t(
                  "dashboard.facebook.generateForm.contextPlaceholder"
                )}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows={3}
                disabled={isGenerating}
              />
            </div>

            {/* Generate Image */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.generateImage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      generateImage: e.target.checked,
                    })
                  }
                  className="me-2"
                  disabled={isGenerating}
                />
                <span className="text-sm font-medium text-gray-700">
                  {t("dashboard.facebook.generateForm.generateImage")}
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                disabled={isGenerating}
              >
                {t("dashboard.facebook.generateForm.cancel")}
              </button>
              <button
                type="submit"
                disabled={isGenerating || !formData.topic.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 me-2" />
                    {t("dashboard.facebook.generateForm.generate")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
