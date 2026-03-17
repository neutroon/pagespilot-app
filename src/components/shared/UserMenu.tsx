"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  ChevronDown,
  LayoutDashboard,
  User as UserIcon,
  CreditCard,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function UserMenu() {
  const t = useTranslations("HomePage");
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-100 transition-colors"
        aria-label={t("login.userMenu")}
      >
        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-slate-900">{user?.name}</div>
          {/* <div className="text-xs text-slate-500">{user.email}</div> */}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-slate-100">
            {/* <div className="text-sm font-medium text-slate-900">
              {user.name}
            </div> */}
            <div className="text-xs text-slate-500">{user?.email}</div>
          </div>

          <div className="py-2">
            <Link
              href={`profile`}
              className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 me-3 text-slate-500" />
              {t("login.profileNav")}
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-2">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 me-3" />
              {t("login.logoutNav")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
