"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/shared/UserMenu";
import LocaleSwitcher from "@/components/shared/LocaleSwitcher";
import { LayoutDashboard, User, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Logo from "@/components/shared/Logo";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

// Navigation items will be created inside the component to use translations

export default function AppNavbar() {
  const pathname = usePathname();
  const params = useParams();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations("HomePage.dashboard");

  const currentLocale = params.locale as string;

  const navigation: NavItem[] = [
    {
      name: t("navigation.dashboard"),
      href: "/user/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: t("navigation.profile"),
      href: "/user/profile",
      icon: <User className="w-5 h-5" />,
    },
  ];

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link
              href="/user/dashboard"
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <Logo ariaLabel="PagesPilot Logo" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                pagesPilot
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              // Check if current pathname matches the route (accounting for locale)
              const isActive =
                pathname.includes(item.href) ||
                (item.href === "/user/dashboard" &&
                  pathname === `/${currentLocale}`) ||
                (item.href === "/user/profile" &&
                  pathname.includes("/user/profile"));
              return (
                <Link
                  key={item.name}
                  href={`/${currentLocale}${item.href}`}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu and Language Toggle */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <LocaleSwitcher currentLocale={currentLocale} />

            <UserMenu />

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                // Check if current pathname matches the route (accounting for locale)
                const isActive =
                  pathname.includes(item.href) ||
                  (item.href === "/user/dashboard" &&
                    pathname === `/${currentLocale}`) ||
                  (item.href === "/user/profile" &&
                    pathname.includes("/user/profile"));
                return (
                  <Link
                    key={item.name}
                    href={`/${currentLocale}${item.href}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Mobile Language Toggle */}
              <div className="pt-2 border-t border-gray-100">
                <div className="px-3 py-2">
                  <LocaleSwitcher currentLocale={currentLocale} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
