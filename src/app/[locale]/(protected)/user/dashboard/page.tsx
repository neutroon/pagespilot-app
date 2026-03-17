"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  dashboardService,
  DashboardStats,
  DashboardActivity,
} from "@/lib/dashboard-api";
import FacebookConnection from "@/components/user/FacebookConnection";
import FacebookFeatures from "@/components/user/FacebookFeatures";
import FacebookPostCreator from "@/components/user/FacebookPostCreator";
import GeneratePostForm from "@/components/user/GeneratePostForm";
import PostReviewModal from "@/components/user/PostReviewModal";
import AppNavbar from "@/components/shared/AppNavbar";
import { FACEBOOK_API } from "@/lib/config";
import {
  Users,
  CheckCircle,
  Zap,
  Plus,
  X,
  User,
  Calendar,
  BarChart3,
  FileText,
  Sparkles,
  Loader2,
} from "lucide-react";
import { facebookAPI, type FacebookPost } from "@/lib/facebook-api";

type FacebookPage = {
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
};
export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const params = useParams();
  const [pagePosts, setPagePosts] = useState<FacebookPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  const fetchPagePosts = useCallback(async (pageId: string, accessToken: string) => {
    if (!accessToken) return;
    
    setIsLoadingPosts(true);
    setSelectedPageId(pageId);
    try {
      const posts = await facebookAPI.getPagePosts(pageId, accessToken);
      setPagePosts(posts);
    } catch (error) {
      console.error("Failed to fetch page posts:", error);
      setPagePosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);
  const locale = params.locale as string;
  const router = useRouter();
  const t = useTranslations("HomePage");

  // State for content creation modals
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [modalTheme, setModalTheme] = useState<"purple" | "blue">("blue");
  const [generatedData, setGeneratedData] = useState<{
    content: string;
    hashtags: string[];
    suggestedImage?: string;
    imageUrl?: string;
    imageError?: string;
  } | null>(null);
  const [connectedPages, setConnectedPages] = useState<FacebookPage[]>([]);
  const [showPostCreatorModal, setShowPostCreatorModal] = useState(false);

  // State for dashboard data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    connectedAccounts: 0,
    postsScheduled: 0,
    totalReach: 0,
  });
  const [dashboardActivity, setDashboardActivity] = useState<
    DashboardActivity[]
  >([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    if (!isLoading && !isAuthenticated && !user) {
      router.push(`/auth/login`);
    }
  }, [isAuthenticated, isLoading, user, router, locale]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      const fbAccessToken = localStorage.getItem("facebook_access_token");
      if (isAuthenticated && !isLoading && fbAccessToken) {
        try {
          setIsLoadingStats(true);
          const [stats, activities] = await Promise.all([
            dashboardService.getDashboardStats(),
            dashboardService.getDashboardActivity(),
          ]);
          setConnectedPages(await facebookAPI.getPages(fbAccessToken || ""));
          setDashboardStats(stats);
          setDashboardActivity(activities);
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        } finally {
          setIsLoadingStats(false);
        }
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, isLoading]);

  const fetchConnectedPages = useCallback(async (): Promise<FacebookPage[]> => {
    if (typeof window === "undefined") {
      return [];
    }

    const isFacebookConnected =
      localStorage.getItem("facebook_connected") === "true";

    if (!isFacebookConnected) {
      setConnectedPages([]);
      return [];
    }

    const accessToken = localStorage.getItem("facebook_access_token");
    if (!accessToken) {
      setConnectedPages([]);
      return [];
    }

    try {
      const response = await fetch(
        `${FACEBOOK_API.PAGES}?access_token=${encodeURIComponent(
          accessToken,
        )}&userId=${user?.id || "1"}`,
        { credentials: "include" },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch connected Facebook pages");
      }

      const data = await response.json();
      const pages = Array.isArray(data.data) ? data.data : [];
      setConnectedPages(pages);
      return pages;
    } catch (error) {
      console.error("Failed to load connected pages:", error);
      setConnectedPages([]);
      return [];
    }
  }, [user]);



  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchConnectedPages();
    }
  }, [isAuthenticated, isLoading, fetchConnectedPages]);

  useEffect(() => {
    if (connectedPages.length === 0 && showPostCreatorModal) {
      setShowPostCreatorModal(false);
    }
  }, [connectedPages, showPostCreatorModal]);

  // Handler functions for content creation
  const handleGeneratePost = () => {
    // Check if Facebook is connected
    const isConnected = localStorage.getItem("facebook_connected");
    if (isConnected === "true") {
      setShowGenerateForm(true);
    } else {
      // Show connection required modal with purple theme
      setModalTheme("purple");
      setShowCreateForm(true);
    }
  };

  const handleCreatePost = async () => {
    // Check if Facebook is connected
    const isConnected = localStorage.getItem("facebook_connected");
    if (isConnected === "true") {
      let pages = connectedPages;
      if (pages.length === 0) {
        pages = await fetchConnectedPages();
      }

      if (pages.length === 0) {
        // Still no pages, show helper modal that directs to mission control
        setModalTheme("blue");
        setShowCreateForm(true);
        return;
      }

      setShowPostCreatorModal(true);
    } else {
      setModalTheme("blue");
      setShowCreateForm(true);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t("dashboard.welcomeBackWithName", {
                  name: user?.name || "User",
                })}
              </h1>
              <p className="text-gray-600 mt-2">
                {t("dashboard.missionControlCenter")}
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {t("dashboard.missionStatus")}
                </p>
                <p className="text-lg font-semibold text-green-600">
                  {t("dashboard.readyToLaunch")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ms-4">
                    <p className="text-sm font-medium text-gray-600">
                      {t("dashboard.stats.connectedAccounts")}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isLoadingStats ? (
                        <Loader2 strokeWidth={3} className="w-6 h-6 animate-spin text-blue-600" />
                      ) : (
                        dashboardStats.connectedAccounts
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ms-4">
                    <p className="text-sm font-medium text-gray-600">
                      {t("dashboard.stats.postsScheduled")}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isLoadingStats ? (
                        <Loader2 strokeWidth={3} className="w-6 h-6 animate-spin text-green-600" />
                      ) : (
                        dashboardStats.postsScheduled
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ms-4">
                    <p className="text-sm font-medium text-gray-600">
                      {t("dashboard.stats.totalReach")}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isLoadingStats ? (
                        <Loader2 strokeWidth={3} className="w-6 h-6 animate-spin text-purple-600" />
                      ) : (
                        dashboardStats.totalReach.toLocaleString()
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Creation Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t("dashboard.contentCreation.title")}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {t("dashboard.contentCreation.subtitle")}
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={handleGeneratePost}
                    className="flex items-center justify-center p-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <div className="text-center">
                      <Sparkles className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-lg font-bold">
                        {t("dashboard.contentCreation.generatePost")}
                      </p>
                      <p className="text-sm opacity-90">
                        {t("dashboard.contentCreation.generatePostDescription")}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={handleCreatePost}
                    className="flex items-center justify-center p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <div className="text-center">
                      <Plus className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-lg font-bold">
                        {t("dashboard.contentCreation.createPost")}
                      </p>
                      <p className="text-sm opacity-90">
                        {t("dashboard.contentCreation.createPostDescription")}
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Mission Control Section */}
            <div
              className="bg-white rounded-xl shadow-sm border border-gray-200"
              data-section="mission-control"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t("dashboard.missionControl.title")}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {t("dashboard.missionControl.subtitle")}
                </p>
              </div>
              <div className="p-6">
                <FacebookConnection locale={locale} onPageSelect={fetchPagePosts} />
                <div className="mt-6">
                  <FacebookFeatures locale={locale} />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("dashboard.quickActions.quickActions")}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <button className="w-full flex items-center p-3 text-start rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center me-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {t("dashboard.quickActions.schedulePosts")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("dashboard.quickActions.schedulePostsDescription")}
                    </p>
                  </div>
                </button>

                <button className="w-full flex items-center p-3 text-start rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center me-3">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {t("dashboard.quickActions.analytics")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("dashboard.quickActions.analyticsDescription")}
                    </p>
                  </div>
                </button>

                <button className="w-full flex items-center p-3 text-start rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center me-3">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {t("dashboard.quickActions.templates")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("dashboard.quickActions.templatesDescription")}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* facebook page posts */}
            {selectedPageId && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Page Posts
                  </h3>
                </div>
                <div className="p-6">
                  {isLoadingPosts ? (
                    <div className="text-center py-8">
                      <Loader2 strokeWidth={3} className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">
                        Loading posts...
                      </p>
                    </div>
                  ) : pagePosts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No posts found or failed to load.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pagePosts.map((post) => (
                        <div key={post.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col space-y-2 hover:shadow-sm transition-shadow">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap leading-relaxed">
                              {post.message || "[No text content]"}
                            </p>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-200 mt-2">
                            <span>{new Date(post.created_time).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            {post.permalink_url && (
                              <a href={post.permalink_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center font-medium">
                                View on Facebook
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("dashboard.recentActivity.title")}
                </h3>
              </div>
              <div className="p-6">
                {isLoadingStats ? (
                  <div className="text-center py-8">
                    <Loader2 strokeWidth={3} className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">
                      {t("dashboard.loading")}
                    </p>
                  </div>
                ) : dashboardActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="w-12 h-12 text-gray-400 mx-auto mb-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      />
                    </svg>
                    <p className="text-gray-500 text-sm">
                      {t("dashboard.recentActivity.noActivity")}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {t("dashboard.recentActivity.startConnecting")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardActivity.slice(0, 5).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${activity.status === "success"
                            ? "bg-green-500"
                            : activity.status === "warning"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                            }`}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("dashboard.systemStatus.title")}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {t("dashboard.systemStatus.navigationSystems")}
                  </span>
                  <span className="text-green-600 font-semibold">
                    ✓ {t("dashboard.systemStatus.online")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {t("dashboard.systemStatus.communication")}
                  </span>
                  <span className="text-green-600 font-semibold">
                    ✓ {t("dashboard.systemStatus.connected")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {t("dashboard.systemStatus.powerSystems")}
                  </span>
                  <span className="text-green-600 font-semibold">
                    ✓ {t("dashboard.systemStatus.optimal")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {t("dashboard.systemStatus.missionControl")}
                  </span>
                  <span className="text-green-600 font-semibold">
                    ✓ {t("dashboard.systemStatus.ready")}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modals */}
      {showGenerateForm && (
        <GeneratePostForm
          onGenerated={handleGenerated}
          onClose={() => setShowGenerateForm(false)}
        />
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {localStorage.getItem("facebook_connected") === "true"
                    ? modalTheme === "purple"
                      ? t("dashboard.modals.generatePost")
                      : t("dashboard.modals.createPost")
                    : modalTheme === "purple"
                      ? t("dashboard.modals.generatePostConnectRequired")
                      : t("dashboard.modals.connectFacebookRequired")}
                </h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {localStorage.getItem("facebook_connected") === "true" ? (
                // Show actual create post form when connected
                <div className="text-center py-8">
                  <div
                    className={`w-16 h-16 ${modalTheme === "purple" ? "bg-purple-100" : "bg-green-100"
                      } rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <CheckCircle
                      className={`w-8 h-8 ${modalTheme === "purple"
                        ? "text-purple-600"
                        : "text-green-600"
                        }`}
                    />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {t("dashboard.modals.facebookConnected")}
                  </h4>
                  <p className="text-gray-600 mb-6">
                    {t("dashboard.modals.facebookConnectedDescription")}
                  </p>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      // Scroll to Mission Control section
                      const missionControl = document.querySelector(
                        '[data-section="mission-control"]',
                      );
                      if (missionControl) {
                        missionControl.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className={`px-6 py-3 ${modalTheme === "purple"
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                      : "bg-blue-600 hover:bg-blue-700"
                      } text-white rounded-xl font-semibold transition-colors`}
                  >
                    {t("dashboard.modals.goToMissionControl")}
                  </button>
                </div>
              ) : (
                // Show connection required message when not connected
                <div className="text-center py-8">
                  <div
                    className={`w-16 h-16 ${modalTheme === "purple" ? "bg-purple-100" : "bg-blue-100"
                      } rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <User
                      className={`w-8 h-8 ${modalTheme === "purple"
                        ? "text-purple-600"
                        : "text-blue-600"
                        }`}
                    />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {t("dashboard.modals.connectFacebookRequired")}
                  </h4>
                  <p className="text-gray-600 mb-6">
                    {t("dashboard.modals.connectFacebookDescription")}
                  </p>
                  <div className="flex space-x-3 justify-center">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      {t("dashboard.modals.cancel")}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        // Scroll to Mission Control section
                        const missionControl = document.querySelector(
                          '[data-section="mission-control"]',
                        );
                        if (missionControl) {
                          missionControl.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className={`px-6 py-3 ${modalTheme === "purple"
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                        : "bg-blue-600 hover:bg-blue-700"
                        } text-white rounded-xl font-semibold transition-colors`}
                    >
                      {t("dashboard.modals.connectFacebook")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

      {showPostCreatorModal && connectedPages.length > 0 && (
        <FacebookPostCreator
          connectedPages={connectedPages}
          onPostCreated={() => {
            fetchConnectedPages();
            setShowPostCreatorModal(false);
          }}
          isOpen={showPostCreatorModal}
          onOpenChange={(open) => setShowPostCreatorModal(open)}
          hideTriggerButtons
        />
      )}
    </div>
  );
}
