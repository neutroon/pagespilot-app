"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ClipboardList,
  BarChart3,
  Facebook,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
} from "lucide-react";
import router from "next/router";
import LocaleSwitcher from "../LocaleSwitcher";

interface AdminSidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export default function AdminSidebar() {
  const { logout } = useAuth();
  const pathname = usePathname();
  const params = useParams();

  const { user, isAuthenticated, isLoading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const t = useTranslations("admin");
  const currentLocale = params.locale as string;

  // Detect if screen is desktop or mobile
  useEffect(() => {
    const checkScreen = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Collapse toggle is only allowed on desktop
  const handleCollapseToggle = () => {
    if (isDesktop) setIsCollapsed((prev) => !prev);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Escape key closes mobile sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Sidebar items
  const navigation: AdminSidebarItem[] = [
    {
      name: t("navigation.dashboard"),
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: t("navigation.users"),
      href: "/admin/users",
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: t("navigation.managers"),
      href: "/admin/managers",
      icon: <UserCheck className="w-5 h-5" />,
    },
    {
      name: t("navigation.assignments"),
      href: "/admin/assignments",
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      name: t("navigation.analytics"),
      href: "/admin/analytics",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      name: t("navigation.facebook"),
      href: "/admin/facebook",
      icon: <Facebook className="w-5 h-5" />,
    },
  ];

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

  const isActive = (href: string) => pathname.includes(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-gray-900">Admin Panel</span>
          )}
        </div>

        {/* Collapse toggle (desktop only) */}
        {isDesktop && (
          <button
            onClick={handleCollapseToggle}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          <h3
            className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ${
              isCollapsed ? "text-center" : ""
            }`}
          >
            {isCollapsed ? "•" : "Admin Navigation"}
          </h3>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={`/${currentLocale}${item.href}`}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium group
                    ${
                      active
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }
                    ${isCollapsed ? "justify-center" : ""}
                  `}
                  title={isCollapsed ? item.name : undefined}
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
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Language Switcher */}
      <LocaleSwitcher currentLocale={currentLocale} />

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div
          className={`flex items-center space-x-3 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div
            onClick={handleLogout}
            className="w-8 h-8 bg-gray-200 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-full flex items-center justify-center cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <Link href={`profile`} className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || "Admin"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </Link>
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
          className="fixed inset-0 backdrop-blur-xs z-40 lg:hidden"
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
        className={`fixed inset-y-0 start-0 z-50 w-64 bg-white border-r border-gray-200 lg:hidden ${
          isMobileOpen
            ? "translate-x-0"
            : currentLocale === "ar"
            ? "translate-x-full"
            : "-translate-x-full"
        }`}
        style={{ transition: "transform 0.3s ease" }}
      >
        <SidebarContent />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={`lg:hidden fixed end-4 top-2 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50`}
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
