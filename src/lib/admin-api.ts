import { fetchWithAuth } from "@/services/auth-api";
import { ADMIN_API } from "./config";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "manager" | "admin" | "super_admin";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  facebookAccounts?: FacebookAccount[];
  analytics?: any[];
}

export interface FacebookAccount {
  id: number;
  facebookUserId: string;
  accessToken: string;
  tokenType: string;
  expiresAt: string | null;
  refreshToken: string | null;
  scope: string | null;
  deviceInfo: string | null;
  isActive: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
  pages: FacebookPage[];
  _count: {
    activities: number;
  };
}

export interface FacebookPage {
  id: number;
  facebookAccountId: number;
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  category: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: "user" | "manager" | "admin";
}

export interface CreateUserResponse {
  message: string;
  user: User;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: "user" | "manager" | "admin" | "super_admin";
}

export interface UpdateUserResponse {
  message: string;
  user: User;
}

// Assignment Types
export interface UserAssignment {
  id: number;
  managerId: number;
  userId: number;
  assignedAt: string;
  assignedBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  manager: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
  assigner: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface AssignUserRequest {
  managerId: number;
  userId: number;
}

export interface AssignUserResponse {
  message: string;
  data: UserAssignment;
}

export interface AssignmentsResponse {
  data: UserAssignment[];
}

// Analytics Types
export interface FacebookAnalytics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalAccounts: number;
    totalPages: number;
    activeRate: number;
  };
  recentActivities: any[];
  userAnalytics: any[];
}

export interface AnalyticsResponse {
  data: FacebookAnalytics;
}

// Admin API Service
class AdminService {
  async getAllUsers(): Promise<User[]> {
    return fetchWithAuth(ADMIN_API.USERS);
  }

  async getUserById(id: number): Promise<User> {
    return fetchWithAuth(ADMIN_API.USER_BY_ID(id));
  }

  async updateUser(
    id: number,
    data: UpdateUserRequest,
  ): Promise<UpdateUserResponse> {
    return fetchWithAuth(ADMIN_API.USER_UPDATE(id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deactivateUser(id: number): Promise<{ message: string; user: User }> {
    return fetchWithAuth(ADMIN_API.USER_DEACTIVATE(id), {
      method: "PATCH",
    });
  }

  async reactivateUser(id: number): Promise<{ message: string; user: User }> {
    return fetchWithAuth(ADMIN_API.USER_REACTIVATE(id), {
      method: "PATCH",
    });
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    return fetchWithAuth(ADMIN_API.USER_DELETE(id), {
      method: "DELETE",
    });
  }

  // Role Management Methods
  async createAdmin(data: CreateUserRequest): Promise<CreateUserResponse> {
    return fetchWithAuth(ADMIN_API.ADD_ADMIN, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createManager(data: CreateUserRequest): Promise<CreateUserResponse> {
    return fetchWithAuth(ADMIN_API.CREATE_MANAGER, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    return fetchWithAuth(ADMIN_API.CREATE_USER, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Assignment Methods
  async assignUserToManager(
    managerId: number,
    userId: number,
  ): Promise<AssignUserResponse> {
    return fetchWithAuth(ADMIN_API.ASSIGN_USER, {
      method: "POST",
      body: JSON.stringify({ managerId, userId }),
    });
  }

  async getAssignments(): Promise<AssignmentsResponse> {
    return fetchWithAuth(ADMIN_API.ASSIGNMENTS);
  }

  async deleteAssignment(
    id: number,
  ): Promise<{ message: string; data: UserAssignment }> {
    return fetchWithAuth(ADMIN_API.ASSIGNMENT_DELETE(id), {
      method: "DELETE",
    });
  }

  // Analytics Methods
  async getAnalytics(): Promise<AnalyticsResponse> {
    return fetchWithAuth(ADMIN_API.FACEBOOK_ANALYTICS);
  }

  async getUserFacebookAccounts(userId: number): Promise<FacebookAccount[]> {
    const response = await fetchWithAuth(
      ADMIN_API.USER_FACEBOOK_ACCOUNTS(userId),
    );
    return response.data || [];
  }

  async deleteFacebookAccount(accountId: number): Promise<{ message: string }> {
    return fetchWithAuth(ADMIN_API.DELETE_FACEBOOK_ACCOUNT(accountId), {
      method: "DELETE",
    });
  }
}

export const adminService = new AdminService();
