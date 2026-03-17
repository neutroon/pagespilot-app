"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  User,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  BarChart3,
  Calendar,
  FileText,
  Sparkles,
  Plus,
  Users,
  CheckCircle,
  Zap,
} from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const t = useTranslations("HomePage.dashboard");

  const currentLocale = params.locale as string;

  // Close mobile sidebar when pathname changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Handle escape key to close mobile sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const navigation: SidebarItem[] = [
    {
      name: t("navigation.dashboard"),
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: t("navigation.profile"),
      href: "/profile",
      icon: <User className="w-5 h-5" />,
    },
    {
      name: t("navigation.settings"),
      href: "/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const quickActions: SidebarItem[] = [
    {
      name: t("quickActions.schedulePosts"),
      href: "#",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      name: t("quickActions.analytics"),
      href: "#",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      name: t("quickActions.templates"),
      href: "#",
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  const contentActions: SidebarItem[] = [
    {
      name: t("contentCreation.generatePost"),
      href: "#",
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      name: t("contentCreation.createPost"),
      href: "#",
      icon: <Plus className="w-5 h-5" />,
    },
  ];

  // Show loading state or return null if not authenticated
  if (isLoading) {
    return (
      <div className="hidden lg:flex flex-col bg-white border-r border-gray-200 w-64">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return (
        pathname.includes("/dashboard") || pathname === `/${currentLocale}`
      );
    }
    return pathname.includes(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full sidebar-content">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-gray-900">PagePilot</span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          <div className="mb-4">
            <h3
              className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ${
                isCollapsed ? "text-center" : ""
              }`}
            >
              {isCollapsed ? "•" : t("navigation.title")}
            </h3>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={`/${currentLocale}${item.href}`}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium sidebar-item group ${
                      active
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    } ${isCollapsed ? "justify-center sidebar-tooltip" : ""}`}
                    title={isCollapsed ? item.name : undefined}
                    data-tooltip={isCollapsed ? item.name : undefined}
                  >
                    <span
                      className={
                        active
                          ? "text-blue-600"
                          : "text-gray-500 group-hover:text-gray-700"
                      }
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && <span>{item.name}</span>}
                    {!isCollapsed && item.badge && (
                      <span className="ms-auto bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Actions */}
          <div className="mb-4">
            <h3
              className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ${
                isCollapsed ? "text-center" : ""
              }`}
            >
              {isCollapsed ? "•" : t("quickActions.title")}
            </h3>
            <nav className="space-y-1">
              {quickActions.map((item) => (
                <button
                  key={item.name}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group text-gray-600 hover:text-gray-900 hover:bg-gray-50 ${
                    isCollapsed ? "justify-center" : ""
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <span className="text-gray-500 group-hover:text-gray-700">
                    {item.icon}
                  </span>
                  {!isCollapsed && <span>{item.name}</span>}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Creation */}
          <div className="mb-4">
            <h3
              className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ${
                isCollapsed ? "text-center" : ""
              }`}
            >
              {isCollapsed ? "•" : t("contentCreation.title")}
            </h3>
            <nav className="space-y-1">
              {contentActions.map((item, index) => (
                <button
                  key={item.name}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    index === 0
                      ? "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 hover:from-purple-100 hover:to-purple-200"
                      : "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 hover:from-blue-100 hover:to-blue-200"
                  } ${isCollapsed ? "justify-center" : ""}`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <span
                    className={
                      index === 0 ? "text-purple-600" : "text-blue-600"
                    }
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && <span>{item.name}</span>}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div
          className={`flex items-center space-x-3 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col bg-white border-r border-gray-200 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
        style={{ transition: "width 0.3s ease" }}
      >
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 lg:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ transition: "transform 0.3s ease" }}
      >
        <SidebarContent />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      >
        {isMobileOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>
    </>
  );
}
