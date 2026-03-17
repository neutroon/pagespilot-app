import { AUTH_API } from "@/lib/config";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  UpdateProfileResponse,
  User,
} from "@/services/api";

// Helper method for authenticated requests

class AuthService {
  private refreshPromise: Promise<boolean> | null = null;
  private refreshInterval: NodeJS.Timeout | null = null;

  // Register new user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetchWithAuth(AUTH_API.REGISTER, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response as AuthResponse;
  }

  // Login user
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetchWithAuth(AUTH_API.LOGIN, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response;
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await fetchWithAuth(AUTH_API.LOGOUT, {
        method: "POST",
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
    return fetchWithAuth(AUTH_API.ME, {
      method: "GET",
    });
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
      const response = await fetchWithAuth(AUTH_API.REFRESH, {
        method: "POST",
      });
      return response;
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
    return fetchWithAuth(AUTH_API.ME, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Change password
  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    return fetchWithAuth(`${AUTH_API.ME}/password`, {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Delete account
  async deleteAccount(): Promise<{ message: string }> {
    return fetchWithAuth(AUTH_API.ME, {
      method: "DELETE",
    });
  }

  // Clean up resources
  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
}
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {},
): Promise<any> => {
  const response = await fetch(url, {
    ...options,
    credentials: "include", // Include HTTP-only cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await authService.refreshToken();
      if (refreshed) {
        // Retry the original request
        return fetchWithAuth(url, options);
      }
      throw new Error("Authentication failed");
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    );
  }

  return await response.json();
};

export const authService = new AuthService();
