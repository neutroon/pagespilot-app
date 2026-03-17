"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import BaseDashboardLayout from "@/components/shared/BaseDashboardLayout";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function ManagerLayout({ children }: AdminLayoutProps) {
  const t = useTranslations("admin");
  const { user, isAuthenticated, isLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const locale = params.locale as string;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/auth/login`);
    }
  }, [isAuthenticated, isLoading, router, locale]);

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

  if (user) {
    return (
      <>
        <BaseDashboardLayout role={"manager"}>{children}</BaseDashboardLayout>
      </>
    );
  } else {
    return <h1>Loading</h1>;
  }
}
