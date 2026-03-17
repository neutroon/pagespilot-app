"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FACEBOOK_API } from "@/lib/config";
import { Plus, Calendar, Facebook, X, Sparkles } from "lucide-react";
import ImageUpload from "./ImageUpload";
import GeneratePostForm from "./GeneratePostForm";
import PostReviewModal from "./PostReviewModal";

interface FacebookPostCreatorProps {
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
  onPostCreated?: () => void;
  /**
   * When provided, the modal becomes controlled by the parent.
   */
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Hide the default trigger buttons when the parent renders its own trigger.
   */
  hideTriggerButtons?: boolean;
}

export default function FacebookPostCreator({
  connectedPages,
  onPostCreated,
  isOpen: controlledIsOpen,
  onOpenChange,
  hideTriggerButtons = false,
}: FacebookPostCreatorProps) {
  const t = useTranslations("HomePage");
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [selectedPage, setSelectedPage] = useState("");
  const [message, setMessage] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [postType, setPostType] = useState<"now" | "schedule">("now");
  const [postFormat, setPostFormat] = useState<"text" | "image">("text");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    content: string;
    hashtags: string[];
    suggestedImage?: string;
    imageUrl?: string;
    imageError?: string;
  } | null>(null);

  const isControlled = typeof controlledIsOpen === "boolean";
  const modalIsOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const setModalOpen = (open: boolean) => {
    onOpenChange?.(open);
    if (!isControlled) {
      setInternalIsOpen(open);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage || !message.trim()) return;
    if (
      postFormat === "image" &&
      (!imageUrl || !/^https?:\/\//.test(imageUrl))
    ) {
      setError("Please upload an image (must be a public URL)");
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

      // Use single /post endpoint for both text and image posts
      const endpoint =
        postType === "schedule" ? FACEBOOK_API.SCHEDULE : FACEBOOK_API.POST;
      const requestBody = {
        pageId: selectedPage,
        message: message.trim(),
        accessToken: page.access_token,
        ...(postFormat === "image" && imageUrl && { imageUrl: imageUrl }),
        ...(postType === "schedule" &&
          scheduleTime && {
            scheduleTime: Math.floor(new Date(scheduleTime).getTime() / 1000),
          }),
      };

      console.log("=== POSTING TO FACEBOOK ===");
      console.log("Endpoint:", endpoint);
      console.log("Request body:", requestBody);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(
          postType === "schedule"
            ? t("dashboard.facebook.createPostModal.postScheduled")
            : t("dashboard.facebook.createPostModal.postPublished")
        );
        setMessage("");
        setScheduleTime("");
        setImageUrl("");
        setPostFormat("text");
        onPostCreated?.();

        // Close modal after success
        setTimeout(() => {
          setModalOpen(false);
          setSuccess("");
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create post");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("dashboard.facebook.createPostModal.failedToCreate")
      );
    } finally {
      setIsPosting(false);
    }
  };

  const handleGenerated = (data: {
    content: string;
    hashtags: string[];
    suggestedImage?: string;
    imageUrl?: string;
    imageError?: string;
  }) => {
    setGeneratedData(data);
    setShowGenerateForm(false);
    setShowReviewModal(true);
  };

  const handlePostFromReview = async (data: {
    pageId: string;
    message: string;
    accessToken: string;
    imageUrl?: string;
    scheduleTime?: number;
  }) => {
    const endpoint = data.scheduleTime
      ? FACEBOOK_API.SCHEDULE
      : FACEBOOK_API.POST;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create post");
    }

    return await response.json();
  };

  if (connectedPages.length === 0) {
    return null;
  }

  return (
    <>
      {/* Action Buttons */}
      {!hideTriggerButtons && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowGenerateForm(true)}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            <span>{t("dashboard.facebook.generatePost")}</span>
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>{t("dashboard.facebook.createPost")}</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {modalIsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("dashboard.facebook.createPostModal.title")}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Page Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("dashboard.facebook.createPostModal.selectPage")}
                  </label>
                  <select
                    value={selectedPage}
                    onChange={(e) => setSelectedPage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">
                      {t("dashboard.facebook.createPostModal.choosePage")}
                    </option>
                    {connectedPages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("dashboard.facebook.createPostModal.message")}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t(
                      "dashboard.facebook.createPostModal.messagePlaceholder"
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    required
                  />
                </div>

                {/* Post Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("dashboard.facebook.createPostModal.postFormat")}
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="text"
                        checked={postFormat === "text"}
                        onChange={(e) =>
                          setPostFormat(e.target.value as "text")
                        }
                        className="me-2"
                      />
                      <span className="text-sm">
                        {t("dashboard.facebook.createPostModal.textOnly")}
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="image"
                        checked={postFormat === "image"}
                        onChange={(e) =>
                          setPostFormat(e.target.value as "image")
                        }
                        className="me-2"
                      />
                      <span className="text-sm">
                        {t("dashboard.facebook.createPostModal.withImage")}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Image Upload */}
                {postFormat === "image" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("dashboard.facebook.selectImage")}
                    </label>
                    <ImageUpload
                      onImageUploaded={(url) => {
                        console.log("=== IMAGE UPLOADED CALLBACK ===");
                        console.log("URL received:", url);
                        console.log("Setting imageUrl to:", url);
                        setImageUrl(url);
                        console.log("imageUrl state should now be:", url);
                      }}
                      onImageRemoved={() => {
                        console.log("=== IMAGE REMOVED CALLBACK ===");
                        setImageUrl("");
                      }}
                      currentImageUrl={imageUrl}
                      disabled={isPosting}
                    />
                  </div>
                )}

                {/* Post Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("dashboard.facebook.createPostModal.postType")}
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="now"
                        checked={postType === "now"}
                        onChange={(e) => setPostType(e.target.value as "now")}
                        className="me-2"
                      />
                      <span className="text-sm">
                        {t("dashboard.facebook.createPostModal.postNow")}
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="schedule"
                        checked={postType === "schedule"}
                        onChange={(e) =>
                          setPostType(e.target.value as "schedule")
                        }
                        className="me-2"
                      />
                      <span className="text-sm">
                        {t("dashboard.facebook.createPostModal.schedule")}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Schedule Time */}
                {postType === "schedule" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("dashboard.facebook.createPostModal.scheduleTime")}
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={postType === "schedule"}
                    />
                  </div>
                )}

                {/* Debug Info */}
                <div className="bg-gray-100 p-3 rounded-lg text-xs">
                  <p>
                    <strong>Debug Info:</strong>
                  </p>
                  <p>Selected Page: {selectedPage || "None"}</p>
                  <p>Message: "{message.trim()}"</p>
                  <p>Post Format: {postFormat}</p>
                  <p>Image URL: {imageUrl || "None"}</p>
                  <p>
                    Button Disabled:{" "}
                    {String(
                      isPosting ||
                        !selectedPage ||
                        !message.trim() ||
                        (postFormat === "image" &&
                          (!imageUrl || !/^https?:\/\//.test(imageUrl)))
                    )}
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  >
                    {t("dashboard.facebook.createPostModal.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isPosting ||
                      !selectedPage ||
                      !message.trim() ||
                      (postFormat === "image" &&
                        (!imageUrl || !/^https?:\/\//.test(imageUrl)))
                    }
                    onClick={() => {
                      console.log("=== SUBMIT BUTTON DEBUG ===");
                      console.log("isPosting:", isPosting);
                      console.log("selectedPage:", selectedPage);
                      console.log("message.trim():", message.trim());
                      console.log("postFormat:", postFormat);
                      console.log("imageUrl:", imageUrl);
                      console.log(
                        "Disabled condition:",
                        isPosting ||
                          !selectedPage ||
                          !message.trim() ||
                          (postFormat === "image" &&
                            (!imageUrl || !/^https?:\/\//.test(imageUrl)))
                      );
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
                  >
                    {isPosting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : postType === "schedule" ? (
                      <>
                        <Calendar className="w-5 h-5 me-2" />
                        {postFormat === "image"
                          ? t("dashboard.facebook.createPostModal.schedule")
                          : t("dashboard.facebook.createPostModal.schedule")}
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 me-2" />
                        {postFormat === "image"
                          ? t("dashboard.facebook.createPostModal.postNow")
                          : t("dashboard.facebook.createPostModal.postNow")}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Generate Post Form */}
      {showGenerateForm && (
        <GeneratePostForm
          onGenerated={handleGenerated}
          onClose={() => setShowGenerateForm(false)}
        />
      )}

      {/* Post Review Modal */}
      {showReviewModal && generatedData && (
        <PostReviewModal
          generatedData={generatedData}
          connectedPages={connectedPages}
          onPost={handlePostFromReview}
          onEdit={() => {
            setShowReviewModal(false);
            setShowGenerateForm(true);
          }}
          onClose={() => {
            setShowReviewModal(false);
            setGeneratedData(null);
          }}
        />
      )}
    </>
  );
}
