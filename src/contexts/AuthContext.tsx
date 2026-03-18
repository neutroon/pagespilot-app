"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { User } from "@/services/api";
import { authService } from "@/services/auth-api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      const res = await authService.getCurrentUser();
      setUser(res);
      localStorage.setItem(
        "facebook_access_token",
        res?.facebookAccounts[0]?.accessToken || ""
      );
      localStorage.setItem("facebook_connected", "true");

    } catch {
      setUser(null);
    }
  };
  // Initial load
  useEffect(() => {
    fetchUser().finally(() => {
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      const { user } = res;
      setUser(user);
      await fetchUser();

      // role-based redirect with locale
      switch (user.role) {
        case "admin":
          router.push(`/admin/dashboard`);
          break;
        case "manager":
          router.push(`/manager/dashboard`);
          break;
        case "user":
          router.push(`/user/dashboard`);
          break;
        case "super_admin":
          router.push(`/super_admin/dashboard`);
          break;
        default:
          router.push(`/user/dashboard`);
          break;
      }
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem("facebook_access_token");
      localStorage.removeItem("facebook_connected");
    } catch { }
    setUser(null);

    router.push(`/auth/login`);
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.register({ name, email, password });
      const { user } = res;
      setUser(user);

      // Extract locale from current pathname
      const locale = pathname.split("/")[1] || "en";

      // Role-based redirect with locale
      switch (user.role) {
        case "admin":
          router.push(`/${locale}/admin/dashboard`);
          break;
        case "manager":
          router.push(`/${locale}/manager/dashboard`);
          break;
        case "user":
          router.push(`/${locale}/user/dashboard`);
          break;
        case "super_admin":
          router.push(`/${locale}/super_admin/dashboard`);
          break;
        default:
          router.push(`/${locale}/user/dashboard`);
          break;
      }
    } catch (err) {
      console.error("Signup error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signup,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
