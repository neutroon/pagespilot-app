"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  FacebookIcon,
  CheckCircleIcon,
  ChartNoAxesCombined,
  MessageCircle,
  PenTool,
  Calendar,
  ChartColumnIncreasing,
} from "lucide-react";

interface FacebookFeaturesProps {
  locale: string;
}

export default function FacebookFeatures({ locale }: FacebookFeaturesProps) {
  const t = useTranslations("HomePage");
  const [activeFeature, setActiveFeature] = useState(0);

  const isRTL = locale === "ar";

  const features = [
    {
      icon: PenTool,
      title: t("dashboard.facebook.features.autoPost.title"),
      description: t("dashboard.facebook.features.autoPost.description"),
      details: t.raw(
        "dashboard.facebook.features.autoPost.details"
      ) as string[],
    },
    {
      icon: Calendar,
      title: t("dashboard.facebook.features.smartScheduling.title"),
      description: t("dashboard.facebook.features.smartScheduling.description"),
      details: t.raw(
        "dashboard.facebook.features.smartScheduling.details"
      ) as string[],
    },
    {
      icon: MessageCircle,
      title: t("dashboard.facebook.features.autoResponses.title"),
      description: t("dashboard.facebook.features.autoResponses.description"),
      details: t.raw(
        "dashboard.facebook.features.autoResponses.details"
      ) as string[],
    },
    {
      icon: ChartNoAxesCombined,
      title: t("dashboard.facebook.features.performanceAnalytics.title"),
      description: t(
        "dashboard.facebook.features.performanceAnalytics.description"
      ),
      details: t.raw(
        "dashboard.facebook.features.performanceAnalytics.details"
      ) as string[],
    },
    {
      icon: ChartColumnIncreasing,
      title: t("dashboard.facebook.features.contentInsights.title"),
      description: t("dashboard.facebook.features.contentInsights.description"),
      details: t.raw(
        "dashboard.facebook.features.contentInsights.details"
      ) as string[],
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <FacebookIcon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {t("dashboard.facebook.features.title")}
          </h3>
          <p className="text-sm text-slate-600">
            {t("dashboard.facebook.features.subtitle")}
          </p>
        </div>
      </div>

      {/* Feature Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {features.map((feature, index) => (
          <button
            key={index}
            onClick={() => setActiveFeature(index)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeFeature === index
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <feature.icon className="w-4 h-4 inline me-2" />
            {feature.title}
          </button>
        ))}
      </div>

      {/* Active Feature Details */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            {(() => {
              const FeatureIcon = features[activeFeature].icon;
              return <FeatureIcon className="w-6 h-6 text-blue-600" />;
            })()}
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-slate-900 mb-2">
              {features[activeFeature].title}
            </h4>
            <p className="text-slate-600 mb-4">
              {features[activeFeature].description}
            </p>
            <ul className="space-y-2">
              {features[activeFeature].details.map((detail, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Integration Status */}
      {/* <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-center space-x-2">
          <CheckCircleIcon className="w-5 h-5 text-green-600" />
          <span className="font-medium text-green-800">
            Facebook Graph API v19.0 Integration Ready
          </span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Full OAuth 2.0 authentication with pages_manage_posts,
          pages_read_engagement, and pages_messaging permissions
        </p>
      </div> */}
    </div>
  );
}
