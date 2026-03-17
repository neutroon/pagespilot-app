"use client";

import { useRouter, usePathname } from "next/navigation";
import { localeNames, type Locale } from "@/i18n/config";
import { trackLanguageSwitch } from "@/lib/analytics";

interface LocaleSwitcherProps {
  currentLocale: string;
}

export default function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine the opposite locale
  const targetLocale: Locale = currentLocale === "en" ? "ar" : "en";

  const handleLocaleToggle = () => {
    // Track the language switch
    trackLanguageSwitch(currentLocale, targetLocale);

    // Redirect to the new locale while preserving the current path structure
    const currentPath = pathname.replace(/^\/[a-z]{2}/, "") || "/";
    const newUrl = `/${targetLocale}${currentPath}`;
    router.push(newUrl);
  };

  return (
    <button
      onClick={handleLocaleToggle}
      className="flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-medium transition-all duration-200 border border-slate-200 hover:border-slate-300 cursor-pointer"
      title={`Switch to ${localeNames[targetLocale]}`}
    >
      {/* Current Language */}
      {/* <span className="text-sm font-semibold">{localeNames[currentLocale as Locale]}</span> */}

      {/* Toggle Icon */}
      {/* <svg
        className="w-4 h-4 transform transition-transform duration-200 hover:scale-110"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg> */}

      {/* Target Language */}
      <span className="text-sm text-slate-500">
        {localeNames[targetLocale]}
      </span>
    </button>
  );
}
