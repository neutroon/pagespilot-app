"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UpdateProfileRequest } from "@/services/api";
import { authService } from "@/services/auth-api";
import {
  businessProfileService,
  // fireRagIngest,
} from "@/lib/business-profile-api";
import UserProfileCard from "@/components/shared/UserProfileCard";
import AppNavbar from "@/components/shared/AppNavbar";
import BusinessProfileForm, { BusinessProfileFormData } from "@/components/user/BusinessProfileForm";

// Helper component for managing a single business profile form
function ProfileEditorCard({
  initialProfile,
  onSaveSuccess
}: {
  initialProfile: any | null;
  onSaveSuccess?: () => void;
}) {
  const [bizData, setBizData] = useState<BusinessProfileFormData | null>(null);
  const [isBizSaving, setIsBizSaving] = useState(false);
  const [bizError, setBizError] = useState<string | null>(null);
  const [ragToast, setRagToast] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
      // Keep ID if we are updating existing profile
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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {initialProfile ? `Configure: ${initialProfile.name}` : "Create New Business Profile"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            This information is used to instruct your AI chatbot and power the knowledge base.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200 text-green-800">
          {successMsg}
        </div>
      )}

      <BusinessProfileForm
        formData={bizData}
        onChange={setBizData}
        isSaving={isBizSaving}
        error={bizError}
        onSave={handleBizSave}
        ragToast={ragToast}
        onDismissRagToast={() => setRagToast(false)}
        submitLabel="Save Business Profile"
      />
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: "",
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Business Profiles state
  const [bizProfiles, setBizProfiles] = useState<any[]>([]);
  const [isProfilesLoading, setIsProfilesLoading] = useState(true);
  const [showNewProfile, setShowNewProfile] = useState(false);

  const loadProfiles = () => {
    setIsProfilesLoading(true);
    businessProfileService.getAll().then((bps) => {
      setBizProfiles(bps);
      setIsProfilesLoading(false);
    }).catch(() => {
      setBizProfiles([]);
      setIsProfilesLoading(false);
    });
  };

  // Active Tab
  const [activeTab, setActiveTab] = useState<"account" | "business">("account");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      });
      loadProfiles();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const updateData: UpdateProfileRequest = {};
      if (formData.name !== user?.name) updateData.name = formData.name;
      if (formData.email !== user?.email) updateData.email = formData.email;
      if (formData.avatar !== user?.avatar) updateData.avatar = formData.avatar;

      const response = await authService.updateProfile(updateData);
      updateUser(response.user);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setIsLoading(false);
      return;
    }

    try {
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to change password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await authService.deleteAccount();
      // This will be handled by the auth context
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to delete account",
      });
    } finally {
      setIsLoading(false);
    }
  };



  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
              }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-gray-200 mb-8">
          <button
            onClick={() => { setActiveTab("account"); setMessage(null); }}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "account"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Account Settings
          </button>
          <button
            onClick={() => { setActiveTab("business"); setMessage(null); }}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "business"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Business Profile
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <UserProfileCard
              user={user}
              onEdit={() => setIsEditing(true)}
              showActions={false}
            />
          </div>

          {/* Settings Forms */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "account" ? (
              <>
                {/* Profile Information */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Profile Information
                    </h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Avatar URL
                        </label>
                        <input
                          type="url"
                          name="avatar"
                          value={formData.avatar}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                        >
                          {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              name: user.name,
                              email: user.email,
                              avatar: user.avatar || "",
                            });
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Full Name
                        </label>
                        <p className="text-sm text-gray-900">{user.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Email Address
                        </label>
                        <p className="text-sm text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Role
                        </label>
                        <p className="text-sm text-gray-900 capitalize">
                          {user.role}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Password Settings */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Password
                    </h2>
                    <button
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {showPasswordForm ? "Cancel" : "Change Password"}
                    </button>
                  </div>

                  {showPasswordForm ? (
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                          minLength={6}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                          minLength={6}
                        />
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                        >
                          {isLoading ? "Updating..." : "Update Password"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordData({
                              currentPassword: "",
                              newPassword: "",
                              confirmPassword: "",
                            });
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Click "Change Password" to update your password.
                    </p>
                  )}
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-lg shadow-md border border-red-200 p-6">
                  <h2 className="text-lg font-semibold text-red-900 mb-4">
                    Danger Zone
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Delete Account
                      </h3>
                      <p className="text-sm text-gray-600">
                        Once you delete your account, there is no going back. Please
                        be certain.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Business Profile Tab
              <div className="space-y-6">
                {isProfilesLoading ? (
                  <div className="flex items-center justify-center p-8 bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <>
                    {bizProfiles.map(bp => (
                      <ProfileEditorCard
                        key={bp.id}
                        initialProfile={bp}
                        onSaveSuccess={loadProfiles}
                      />
                    ))}

                    {bizProfiles.length === 0 && (
                      <ProfileEditorCard initialProfile={null} onSaveSuccess={loadProfiles} />
                    )}

                    {bizProfiles.length > 0 && !showNewProfile && (
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={() => setShowNewProfile(true)}
                          className="bg-white hover:bg-slate-50 text-indigo-600 px-6 py-3 font-medium rounded-xl border border-indigo-200 shadow-sm transition-colors w-full sm:w-auto"
                        >
                          + Add Another Business Profile
                        </button>
                      </div>
                    )}

                    {showNewProfile && (
                      <div className="relative">
                        <div className="absolute top-4 right-4 z-10">
                          <button
                            onClick={() => setShowNewProfile(false)}
                            className="bg-red-50 text-red-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                        <ProfileEditorCard
                          initialProfile={null}
                          onSaveSuccess={() => {
                            loadProfiles();
                            setShowNewProfile(false);
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delete Account
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete your account? This action cannot
                be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {isLoading ? "Deleting..." : "Yes, Delete Account"}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
