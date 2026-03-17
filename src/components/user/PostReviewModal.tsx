"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X, Plus, Calendar, Edit } from "lucide-react";
import Image from "next/image";

interface PostReviewModalProps {
  generatedData: {
    content: string;
    hashtags: string[];
    suggestedImage?: string;
    imageUrl?: string;
    imageError?: string;
  };
  connectedPages: Array<{
    id: string;
    name: string;
    access_token: string;
    category: string;
    followers_count?: number;
    picture?: {
      data: {
        url: string;
      };
    };
  }>;
  onPost: (data: {
    pageId: string;
    message: string;
    accessToken: string;
    imageUrl?: string;
    scheduleTime?: number;
  }) => Promise<void>;
  onEdit: () => void;
  onClose: () => void;
}

export default function PostReviewModal({
  generatedData,
  connectedPages,
  onPost,
  onEdit,
  onClose,
}: PostReviewModalProps) {
  const t = useTranslations("HomePage");
  const [isPosting, setIsPosting] = useState(false);
  const [selectedPage, setSelectedPage] = useState("");
  const [postType, setPostType] = useState<"now" | "schedule">("now");
  const [scheduleTime, setScheduleTime] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) {
      setError(t("dashboard.facebook.reviewModal.pleaseSelectPage"));
      return;
    }

    setIsPosting(true);
    setError("");
    setSuccess("");

    try {
      const page = connectedPages.find((p) => p.id === selectedPage);
      if (!page) {
        throw new Error("Selected page not found");
      }

      const message = `${
        generatedData.content
      }\n\n${generatedData.hashtags.join(" ")}`;

      const postData = {
        pageId: selectedPage,
        message: message.trim(),
        accessToken: page.access_token,
        ...(generatedData.imageUrl && { imageUrl: generatedData.imageUrl }),
        ...(postType === "schedule" &&
          scheduleTime && {
            scheduleTime: Math.floor(new Date(scheduleTime).getTime() / 1000),
          }),
      };

      console.log("=== POSTING GENERATED CONTENT ===");
      console.log("Post data:", postData);

      await onPost(postData);

      setSuccess(
        postType === "schedule"
          ? t("dashboard.facebook.reviewModal.postScheduled")
          : t("dashboard.facebook.reviewModal.postPublished")
      );

      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("dashboard.facebook.reviewModal.failedToCreate")
      );
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("dashboard.facebook.reviewModal.title")}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full me-2"></div>
                <span className="text-green-800 text-sm">{success}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full me-2"></div>
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Generated Content Preview */}
          <div className="space-y-4">
            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("dashboard.facebook.reviewModal.generatedContent")}
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {generatedData.content}
                </p>
                {generatedData.hashtags.length > 0 && (
                  <div className="mt-2">
                    <p className="text-blue-600 text-sm">
                      {generatedData.hashtags.join(" ")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Generated Image */}
            {generatedData.imageUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generated Image
                </label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={generatedData.imageUrl}
                    alt="Generated image"
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
            )}

            {/* Image Generation Error */}
            {generatedData.imageError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full me-2"></div>
                  <span className="text-yellow-800 text-sm">
                    Image generation failed: {generatedData.imageError}
                  </span>
                </div>
              </div>
            )}

            {/* Suggested Image Description */}
            {generatedData.suggestedImage && !generatedData.imageUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suggested Image Description
                </label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-sm">
                    {generatedData.suggestedImage}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Post Settings */}
          <form onSubmit={handlePost} className="space-y-4 mt-6">
            {/* Page Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Page *
              </label>
              <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isPosting}
              >
                <option value="">Choose a page...</option>
                {connectedPages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Post Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="now"
                    checked={postType === "now"}
                    onChange={(e) => setPostType(e.target.value as "now")}
                    className="me-2"
                    disabled={isPosting}
                  />
                  <span className="text-sm">Post Now</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="schedule"
                    checked={postType === "schedule"}
                    onChange={(e) => setPostType(e.target.value as "schedule")}
                    className="me-2"
                    disabled={isPosting}
                  />
                  <span className="text-sm">Schedule</span>
                </label>
              </div>
            </div>

            {/* Schedule Time */}
            {postType === "schedule" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={postType === "schedule"}
                  disabled={isPosting}
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onEdit}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center transition-all duration-200"
                disabled={isPosting}
              >
                <Edit className="w-5 h-5 me-2" />
                Edit
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                disabled={isPosting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPosting || !selectedPage}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
              >
                {isPosting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : postType === "schedule" ? (
                  <>
                    <Calendar className="w-5 h-5 me-2" />
                    Schedule
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 me-2" />
                    Post Now
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
