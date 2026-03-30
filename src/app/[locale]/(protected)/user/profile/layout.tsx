"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import AppNavbar from "@/components/shared/AppNavbar";
import { User, Briefcase } from "lucide-react";

export default function ProfileLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;

  const tabs = [
    {
      name: "Account Information",
      href: `/${locale}/user/profile`,
      icon: <User className="w-5 h-5" />,
      exact: true
    },
    {
      name: "Business Profiles",
      href: `/${locale}/user/profile/business`,
      icon: <Briefcase className="w-5 h-5" />,
      exact: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar />
      
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your personal information and chatbot configurations
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const isActive = tab.exact 
                  ? pathname === tab.href 
                  : pathname.startsWith(tab.href);

                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    <span className={isActive ? "text-indigo-600" : "text-slate-400"}>
                      {tab.icon}
                    </span>
                    <span>{tab.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Pane */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
