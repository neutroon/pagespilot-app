"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import {
  extractDashboardType,
  isDashboardRoute,
  canAccessDashboard,
  getRedirectUrl,
  type Role,
  type DashboardType,
} from "@/lib/role-config";

export function DashboardProtection() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only run if user is authenticated and loaded
    if (isLoading || !isAuthenticated || !user) {
      return;
    }

    // Extract locale from pathname
    const pathSegments = pathname.split("/");
    const locale = pathSegments[1] || "en";
    const pathWithoutLocale = "/" + pathSegments.slice(2).join("/");

    // Check if we're on a dashboard route
    if (!isDashboardRoute(pathWithoutLocale)) {
      return; // Not a dashboard route, no protection needed
    }

    // Extract dashboard type from current path
    const currentDashboard = extractDashboardType(pathWithoutLocale);

    if (!currentDashboard) {
      return; // Invalid dashboard route
    }

    const userRole = user.role as Role;

    // Check if user can access this dashboard
    if (!canAccessDashboard(userRole, currentDashboard)) {
      // User cannot access this dashboard, redirect to appropriate one
      const redirectUrl = getRedirectUrl(userRole, locale);
      router.replace(redirectUrl);
      return;
    }

    // If user can access this dashboard but it's not their default dashboard,
    // redirect them to their appropriate dashboard
    const appropriateDashboard = getRedirectUrl(userRole, locale);
    const currentUrl = `/${locale}/${currentDashboard}/dashboard`;

    if (appropriateDashboard !== currentUrl) {
      router.replace(appropriateDashboard);
    }
  }, [isAuthenticated, isLoading, user, pathname, router]);

  // This component doesn't render anything - it only handles redirects
  return null;
}
