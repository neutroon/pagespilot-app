"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AdminSidebar,
  ManagerSidebar,
  UserSidebar,
} from "@/components/shared/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface AdminLayoutProps {
  role: "admin" | "manager" | "user";
  children: React.ReactNode;
}

export default function BaseDashboardLayout({
  role,
  children,
}: AdminLayoutProps) {
  const t = useTranslations("admin");
  const { isAuthenticated, isLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const locale = params.locale as string;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/auth/login`);
    }
  }, [isAuthenticated, isLoading, router, locale]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setUserRole(user.role);
    } else {
      setUserRole("user");
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }
  const [userRole, setUserRole] = useState<string>("user");
  console.log("userRole: ", userRole);
  console.log("userRole: ", role);
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Admin Sidebar */}
      {/* {userRole === role && <AdminSidebar />}
      {userRole === role && <ManagerSidebar />}
      {userRole === role && <UserSidebar />} */}

      {"admin" === role && <AdminSidebar />}
      {"manager" === role && <ManagerSidebar />}
      {"user" === role && <UserSidebar />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar for Mobile */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">
              {t("navigation.adminPanel")}
            </h1>
            <div className="flex items-center space-x-2">
              {/* Add any mobile-specific controls here */}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
