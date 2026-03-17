"use client";
import BaseDashboardLayout from "@/components/shared/BaseDashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

interface LocaleLayoutProps {
  children: React.ReactNode;
}
export default function AdminLayout({ children }: LocaleLayoutProps) {
  const { user } = useAuth();
  if (user) {
    return (
      <>
        <BaseDashboardLayout role={"admin"}>{children}</BaseDashboardLayout>
      </>
    );
  } else {
    return <h1>Loading</h1>;
  }
}
