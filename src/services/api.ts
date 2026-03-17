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
