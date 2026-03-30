"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { API_CONFIG, FACEBOOK_API } from "@/lib/config";
import { facebookAPI } from "@/lib/facebook-api";
import { businessProfileService, BusinessProfile } from "@/lib/business-profile-api";
import { Facebook, CheckCircle, X, Loader2, Link2, AlertCircle } from "lucide-react";
import Image from "next/image";

interface FacebookPage {
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
}

interface FacebookConnectionProps {
  locale: string;
  onPageSelect?: (pageId: string, accessToken: string) => void;
}

export default function FacebookConnection({
  locale,
  onPageSelect,
}: FacebookConnectionProps) {
  const t = useTranslations("HomePage");
  const { user } = useAuth();
  const [connectedPages, setConnectedPages] = useState<FacebookPage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isRTL = locale === "ar";

  // Linking state
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [selectedProfileIds, setSelectedProfileIds] = useState<Record<string, number>>({});
  const [linkedPageIds, setLinkedPageIds] = useState<Set<string>>(new Set());
  const [linkingPageId, setLinkingPageId] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<{ pageId: string; msg: string } | null>(null);

  useEffect(() => {
    // Check if we have an OAuth callback code
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      handleOAuthCallback(code);
    } else {
      // Check if user has existing Facebook connection
      const isConnected = localStorage.getItem("facebook_connected");
      if (isConnected === "true") {
        fetchConnectedPages();
      }
    }

    // Fetch business profiles for linking options
    businessProfileService.getAll().then((bps) => {
      setBusinessProfiles(bps);
    }).catch(() => {});

  }, []);

  const handleOAuthCallback = async (code: string) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Exchange the code for access token via your backend
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      const response = await fetch(
        `${FACEBOOK_API.CALLBACK}?code=${encodeURIComponent(
          code
        )}&redirect_uri=${encodeURIComponent(redirectUri)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("OAuth callback response:", data);

        // Your backend returns { access_token: "..." }
        if (data.tokenData.access_token) {
          // Store access token in localStorage for persistence
          localStorage.setItem(
            "facebook_access_token",
            data.tokenData.access_token
          );
          localStorage.setItem("facebook_connected", "true");

          setSuccess(t("dashboard.facebook.pageConnected"));

          // Clean up the URL by removing the code parameter
          const url = new URL(window.location.href);
          url.searchParams.delete("code");
          window.history.replaceState({}, "", url.toString());

          // Fetch the connected pages
          await fetchConnectedPages();
        } else {
          setError("No access token received from Facebook");
        }
      } else {
        const errorData = await response.json();
        console.warn("OAuth callback error:", errorData);
        setWarning(errorData.error || "Failed to connect Facebook account");
      }
    } catch (err) {
      console.error("OAuth callback error:", err);
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConnectedPages = async () => {
    setIsLoading(true);
    try {
      // Get access token from localStorage
      const accessToken = localStorage.getItem("facebook_access_token");

      if (!accessToken) {
        console.log("No Facebook access token found");
        setConnectedPages([]);
        return;
      }

      // Call your backend pages endpoint with access token
      const response = await fetch(
        `${FACEBOOK_API.PAGES}?access_token=${encodeURIComponent(
          accessToken
        )}&userId=${user?.id || "1"}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Pages response:", data);

        // Your backend returns Facebook Graph API format: { data: [...] }
        const pages = data.data || [];
        setConnectedPages(pages);
      } else {
        console.error("Failed to fetch pages:", response.status);
        setConnectedPages([]);
      }
    } catch (err) {
      console.error("Error fetching pages:", err);
      setConnectedPages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const initiateFacebookConnection = async () => {
    setIsConnecting(true);
    setError("");
    setSuccess("");

    try {
      // Construct the redirect URI for your backend
      const redirectUri = `${window.location.origin}${window.location.pathname}`;

      // Use your existing backend API with redirect URI
      const response = await fetch(
        `${FACEBOOK_API.LOGIN}?redirect_uri=${encodeURIComponent(redirectUri)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to initiate Facebook connection"
        );
      }

      const data = await response.json();
      console.log("Login response:", data);

      // Redirect to Facebook OAuth
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error("No auth URL received from backend");
      }
    } catch (err) {
      console.error("Facebook connection error:", err);
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectPage = async (pageId: string) => {
    try {
      const response = await fetch(`${FACEBOOK_API.PAGES}/${pageId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        setConnectedPages((prev) => prev.filter((page) => page.id !== pageId));
        setSuccess(t("dashboard.facebook.pageDisconnected"));

        // Clear localStorage if no pages left
        const remainingPages = connectedPages.filter(
          (page) => page.id !== pageId
        );
        if (remainingPages.length === 0) {
          localStorage.removeItem("facebook_access_token");
          localStorage.removeItem("facebook_connected");
        }
      } else {
        throw new Error("Failed to disconnect page");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnect failed");
    }
  };

  const linkToChatbot = async (pageId: string) => {
    // Determine the profile ID: either explicitly selected or currently linked
    const currentlyLinkedProfile = businessProfiles.find((bp) => bp.isConnectedToMeta && bp.socialId === pageId) 
                || (linkedPageIds.has(pageId) ? businessProfiles.find((bp) => bp.id === selectedProfileIds[pageId]) : null);
                
    const profileId = selectedProfileIds[pageId] || currentlyLinkedProfile?.id;
    
    if (!profileId) {
      setLinkError({ pageId, msg: t("dashboard.facebook.selectProfileToLink") || "Select a business profile first" });
      return;
    }

    setLinkingPageId(pageId);
    setLinkError(null);

    try {
      await facebookAPI.linkPageToBusiness(pageId, profileId);
      setLinkedPageIds((prev) => new Set(prev).add(pageId));
      setBusinessProfiles((prev) => 
        prev.map(bp => {
          if (bp.id === profileId) {
            return { ...bp, isConnectedToMeta: true, socialId: pageId };
          }
          if (bp.socialId === pageId) {
            return { ...bp, isConnectedToMeta: false, socialId: null };
          }
          return bp;
        })
      );
    } catch (err) {
      setLinkError({
        pageId,
        msg: err instanceof Error ? err.message : "Failed to link to chatbot",
      });
    } finally {
      setLinkingPageId(null);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Facebook className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {t("dashboard.facebook.connectedPages")}
            </h3>
            <p className="text-sm text-slate-600">
              {connectedPages.length}{" "}
              {connectedPages.length === 1 ? "page" : "pages"} connected
            </p>
          </div>
        </div>

        <button
          onClick={initiateFacebookConnection}
          disabled={isConnecting}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t("dashboard.facebook.loading")}</span>
            </>
          ) : (
            <>
              <Facebook className="w-5 h-5" />
              <span>{t("dashboard.facebook.connectNow")}</span>
            </>
          )}
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 me-3" />
            <span className="text-green-800 text-sm font-medium">
              {success}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <X className="w-5 h-5 text-red-500 me-3" />
            <span className="text-red-800 text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {warning && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center">
            <X className="w-5 h-5 text-yellow-500 me-3" />
            <span className="text-yellow-800 text-sm font-medium">
              {warning}
            </span>
          </div>
        </div>
      )}

      {/* Connected Pages */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          <span className="ms-2 text-slate-600">
            {t("dashboard.facebook.loading")}
          </span>
        </div>
      ) : connectedPages.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Facebook className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-medium text-slate-900 mb-2">
            {t("dashboard.facebook.noPagesConnected")}
          </h4>
          <p className="text-slate-600 mb-2">
            {t("dashboard.facebook.selectPage")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.isArray(connectedPages) && connectedPages.length > 0 ? (
            connectedPages.map((page) => {
              const linkedProfile = businessProfiles.find((bp) => bp.isConnectedToMeta && bp.socialId === page.id) 
                || (linkedPageIds.has(page.id) ? businessProfiles.find((bp) => bp.id === selectedProfileIds[page.id]) : null);

              const currentSelectValue = selectedProfileIds[page.id] !== undefined ? selectedProfileIds[page.id] : (linkedProfile?.id || "");
              const isSwitchingToSame = linkedProfile && currentSelectValue === linkedProfile.id;

              return (
              <div key={page.id} className="flex flex-col gap-2">
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 transition-colors gap-4"
                >
                  <div 
                    className="flex items-center space-x-4 cursor-pointer flex-1"
                    onClick={() => onPageSelect?.(page.id, page.access_token)}
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      {page.picture ? (
                        <Image
                          src={page.picture.data.url}
                          alt={page.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <Facebook className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 line-clamp-1">{page.name}</h4>
                      <p className="text-sm text-slate-600 line-clamp-1">
                        {page.category} •{" "}
                        {formatNumber(page.followers_count || 0)}{" "}
                        {t("dashboard.facebook.followers")}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {page.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 sm:flex-shrink-0">
                    <div className="hidden sm:flex items-center space-x-1 me-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600 font-medium">
                        {t("dashboard.facebook.active")}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                        {linkedProfile && (
                          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-semibold me-2">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Linked
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {businessProfiles.length > 0 && (
                            <select
                              className="px-2 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                              value={selectedProfileIds[page.id] !== undefined ? selectedProfileIds[page.id] : (linkedProfile?.id || "")}
                              onChange={(e) =>
                                setSelectedProfileIds((prev) => ({
                                  ...prev,
                                  [page.id]: Number(e.target.value),
                                }))
                              }
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="">Select profile...</option>
                              {businessProfiles.map((bp) => (
                                <option key={bp.id} value={bp.id}>
                                  {bp.name}
                                </option>
                              ))}
                            </select>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              linkToChatbot(page.id);
                            }}
                            disabled={
                              linkingPageId === page.id || 
                              businessProfiles.length === 0 || 
                              !currentSelectValue ||
                              Boolean(isSwitchingToSame)
                            }
                            title={!businessProfiles.length ? "Set up your business profile first" : ""}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          >
                            {linkingPageId === page.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Link2 className="w-4 h-4" />
                            )}
                            {linkedProfile ? "Switch" : "Link"}
                          </button>
                        </div>
                      </div>
                  </div>
                </div>
                
                {/* Per-page error */}
                {linkError?.pageId === page.id && (
                  <div className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 animate-[fadeInUp_0.3s_ease]">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {linkError.msg}
                  </div>
                )}
              </div>
            );
          })
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Facebook className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">
                {t("dashboard.facebook.noPagesConnected")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
