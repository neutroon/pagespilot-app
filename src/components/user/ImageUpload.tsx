"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { FACEBOOK_API } from "@/lib/config";
import { X, PenTool } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved: () => void;
  currentImageUrl?: string;
  disabled?: boolean;
}

export default function ImageUpload({
  onImageUploaded,
  onImageRemoved,
  currentImageUrl,
  disabled = false,
}: ImageUploadProps) {
  const t = useTranslations("HomePage");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a valid image file (JPG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (10MB limit to match backend)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("Image size must be less than 10MB");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      // Create preview first
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        setPreviewUrl(previewUrl);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary via backend
      const formData = new FormData();
      formData.append("image", file);

      console.log("=== UPLOADING TO CLOUDINARY ===");
      console.log("Backend URL:", FACEBOOK_API.UPLOAD_IMAGE);
      console.log("File:", file.name, "Size:", file.size, "Type:", file.type);

      const response = await fetch(FACEBOOK_API.UPLOAD_IMAGE, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      console.log("=== RESPONSE RECEIVED ===");
      console.log("Status:", response.status, "OK:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("=== UPLOAD SUCCESS ===");
        console.log("Response data:", data);

        // Get the Cloudinary URL from backend response
        const imageUrl = data.imageUrl || data.secure_url || data.url;

        if (imageUrl) {
          console.log("Cloudinary URL received:", imageUrl);
          onImageUploaded(imageUrl);
        } else {
          console.log(
            "No Cloudinary URL from backend, using preview as fallback"
          );
          console.log(
            "This will cause Facebook API error - backend needs to return proper URL"
          );
          onImageUploaded(previewUrl || "");
        }
      } else {
        const errorData = await response.json();
        console.log("=== UPLOAD FAILED ===");
        console.log("Error:", errorData);
        throw new Error(errorData.error || "Failed to upload image");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setError("");
    onImageRemoved();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-3">
      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Upload Area */}
      {!previewUrl && (
        <div
          onClick={handleClick}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${
              disabled || isUploading
                ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            }
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600">Uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <PenTool className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {t("dashboard.facebook.selectImage")}
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, GIF, WebP up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Preview */}
      {previewUrl && (
        <div className="relative">
          <div className="relative group">
            <Image
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={disabled || isUploading}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-green-600 mt-1 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full me-1"></div>
            {t("dashboard.facebook.imageSelected")}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full me-2"></div>
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
