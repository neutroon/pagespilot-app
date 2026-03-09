import { AUTH_API } from "@/lib/config";

// Types for authentication
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  facebookAccounts: {
    id: number;
    userId: number;
    facebookUserId: string;
    accessToken: string;
    tokenType: string;
    expiresAt: string | null;
    refreshToken: string | null;
    scope: string | null;
    isActive: boolean;
    lastUsedAt: string;
    deviceInfo: string;
    createdAt: string;
    updatedAt: string;
    pages: any[];
    _count: {
      activities: number;
    };
  }[];
}

export interface AuthResponse {
  user: User;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RefreshResponse {
  user: User;
  message?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface UpdateProfileResponse {
  user: User;
  message?: string;
}

// Production-ready Auth API service with HTTP-only cookies
class AuthService {
  private refreshPromise: Promise<boolean> | null = null;
  private refreshInterval: NodeJS.Timeout | null = null;

  // Register new user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(AUTH_API.REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Essential for HTTP-only cookies
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    const result = await response.json();
    return result;
  }

  // Login user
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(AUTH_API.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Essential for HTTP-only cookies
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const result = await response.json();
    return result;
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await fetch(AUTH_API.LOGOUT, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and stop refresh interval
      localStorage.removeItem("user_data");
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(AUTH_API.ME, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry the request
            const retryResponse = await fetch(AUTH_API.ME, {
              method: "GET",
              credentials: "include",
            });
            if (retryResponse.ok) {
              return await retryResponse.json();
            }
          }
        }
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  // Refresh access token
  async refreshToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._performRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    return result;
  }

  private async _performRefresh(): Promise<boolean> {
    try {
      const response = await fetch(AUTH_API.REFRESH, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        // Refresh failed, user needs to login again
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Token refresh error:", error);
      this.logout();
      return false;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  // Set up automatic token refresh
  setupTokenRefresh() {
    // Clear any existing interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Refresh token every 14 minutes (before 15-minute expiry)
    this.refreshInterval = setInterval(
      async () => {
        const isAuth = await this.isAuthenticated();
        if (isAuth) {
          await this.refreshToken();
        }
      },
      14 * 60 * 1000,
    ); // 14 minutes
  }

  // Update user profile
  async updateProfile(
    data: UpdateProfileRequest,
  ): Promise<UpdateProfileResponse> {
    const response = await fetch(AUTH_API.ME, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Profile update failed");
    }

    const result = await response.json();
    return result;
  }

  // Change password
  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const response = await fetch(`${AUTH_API.ME}/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Password change failed");
    }

    return await response.json();
  }

  // Delete account
  async deleteAccount(): Promise<{ message: string }> {
    const response = await fetch(AUTH_API.ME, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Account deletion failed");
    }

    return await response.json();
  }

  // Clean up resources
  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
}

// Create singleton instance
export const authService = new AuthService();

// Legacy API for leads
const api = {
  postLead: async (
    name: string,
    email: string,
    url: string,
    message: string,
  ) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API}/leads`, {
      method: "POST",
      body: JSON.stringify({ name, email, url, message }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.json();
  },
};

export default api;
