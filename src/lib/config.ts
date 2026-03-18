// Configuration for API endpoints
export const API_CONFIG = {
  // Backend API base URL
  BACKEND_URL: process.env.NEXT_PUBLIC_API || "http://localhost:8080",

  // Facebook API endpoints
  FACEBOOK: {
    LOGIN: "/v1/facebook/login",
    CALLBACK: "/v1/facebook/login/callback",
    PAGES: "/v1/facebook/pages",
    POST: "/v1/facebook/post",
    SCHEDULE: "/v1/facebook/schedule",
    UPLOAD_IMAGE: "/v1/facebook/upload-image",
    GENERATE_POST: "/v1/content/generate-post",
  },

  // Authentication API endpoints
  AUTH: {
    REGISTER: "/v1/auth/register",
    LOGIN: "/v1/auth/login",
    LOGOUT: "/v1/auth/logout",
    REFRESH: "/v1/auth/refresh",
    ME: "/v1/auth/me",
  },

  // User endpoints
  USER: {
    PROFILE: "/v1/user/profile",
    PREFERENCES: "/v1/user/preferences",
  },

  // Admin API endpoints
  ADMIN: {
    // User Management
    USERS: "/v1/admin/users",
    USER_BY_ID: "/v1/admin/users/:id",
    USER_DEACTIVATE: "/v1/admin/users/:id/deactivate",
    USER_REACTIVATE: "/v1/admin/users/:id/reactivate",
    USER_DELETE: "/v1/admin/users/:id",
    USER_UPDATE: "/v1/admin/users/:id",

    // Role Management
    ADD_ADMIN: "/v1/admin/addAdmin",
    CREATE_MANAGER: "/v1/admin/create-manager",
    CREATE_USER: "/v1/admin/create-user",

    // User Assignments
    ASSIGN_USER: "/v1/admin/assign-user",
    ASSIGNMENTS: "/v1/admin/assignments",
    ASSIGNMENT_DELETE: "/v1/admin/assignments/:id",

    // Facebook Analytics
    FACEBOOK_ANALYTICS: "/v1/admin/facebook/analytics",
    USER_FACEBOOK_ACCOUNTS: "/v1/admin/facebook/users/:id/accounts",
    DELETE_FACEBOOK_ACCOUNT: "/v1/admin/facebook/accounts/:id",
  },

  // Manager API endpoints
  MANAGER: {
    CREATE_USER: "/v1/manager/create-user",
    MY_USERS: "/v1/manager/my-users",
    DASHBOARD: "/v1/manager/dashboard",
    MY_MANAGERS: "/v1/manager/my-managers",
    USER_ANALYTICS: "/v1/manager/my-users/:id/analytics",
    USER_BY_ID: "/v1/manager/my-users/:id",
    USER_DEACTIVATE: "/v1/manager/my-users/:id/deactivate",
    USER_REACTIVATE: "/v1/manager/my-users/:id/reactivate",
  },
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BACKEND_URL}${endpoint}`;
};

// Facebook API URLs
export const FACEBOOK_API = {
  LOGIN: buildApiUrl(API_CONFIG.FACEBOOK.LOGIN),
  CALLBACK: buildApiUrl(API_CONFIG.FACEBOOK.CALLBACK),
  PAGES: buildApiUrl(API_CONFIG.FACEBOOK.PAGES),
  POST: buildApiUrl(API_CONFIG.FACEBOOK.POST),
  SCHEDULE: buildApiUrl(API_CONFIG.FACEBOOK.SCHEDULE),
  UPLOAD_IMAGE: buildApiUrl(API_CONFIG.FACEBOOK.UPLOAD_IMAGE),
  GENERATE_POST: buildApiUrl(API_CONFIG.FACEBOOK.GENERATE_POST),
};

// Auth API URLs
export const AUTH_API = {
  REGISTER: buildApiUrl(API_CONFIG.AUTH.REGISTER),
  LOGIN: buildApiUrl(API_CONFIG.AUTH.LOGIN),
  LOGOUT: buildApiUrl(API_CONFIG.AUTH.LOGOUT),
  REFRESH: buildApiUrl(API_CONFIG.AUTH.REFRESH),
  ME: buildApiUrl(API_CONFIG.AUTH.ME),
};

// Admin API URLs
export const ADMIN_API = {
  // User Management
  USERS: buildApiUrl(API_CONFIG.ADMIN.USERS),
  USER_BY_ID: (id: number) =>
    buildApiUrl(API_CONFIG.ADMIN.USER_BY_ID.replace(":id", id.toString())),
  USER_DEACTIVATE: (id: number) =>
    buildApiUrl(API_CONFIG.ADMIN.USER_DEACTIVATE.replace(":id", id.toString())),
  USER_REACTIVATE: (id: number) =>
    buildApiUrl(API_CONFIG.ADMIN.USER_REACTIVATE.replace(":id", id.toString())),
  USER_DELETE: (id: number) =>
    buildApiUrl(API_CONFIG.ADMIN.USER_DELETE.replace(":id", id.toString())),
  USER_UPDATE: (id: number) =>
    buildApiUrl(API_CONFIG.ADMIN.USER_UPDATE.replace(":id", id.toString())),

  // Role Management
  ADD_ADMIN: buildApiUrl(API_CONFIG.ADMIN.ADD_ADMIN),
  CREATE_MANAGER: buildApiUrl(API_CONFIG.ADMIN.CREATE_MANAGER),
  CREATE_USER: buildApiUrl(API_CONFIG.ADMIN.CREATE_USER),

  // User Assignments
  ASSIGN_USER: buildApiUrl(API_CONFIG.ADMIN.ASSIGN_USER),
  ASSIGNMENTS: buildApiUrl(API_CONFIG.ADMIN.ASSIGNMENTS),
  ASSIGNMENT_DELETE: (id: number) =>
    buildApiUrl(
      API_CONFIG.ADMIN.ASSIGNMENT_DELETE.replace(":id", id.toString()),
    ),

  // Facebook Analytics
  FACEBOOK_ANALYTICS: buildApiUrl(API_CONFIG.ADMIN.FACEBOOK_ANALYTICS),
  USER_FACEBOOK_ACCOUNTS: (id: number) =>
    buildApiUrl(
      API_CONFIG.ADMIN.USER_FACEBOOK_ACCOUNTS.replace(":id", id.toString()),
    ),
  DELETE_FACEBOOK_ACCOUNT: (id: number) =>
    buildApiUrl(
      API_CONFIG.ADMIN.DELETE_FACEBOOK_ACCOUNT.replace(":id", id.toString()),
    ),
};

// Manager API URLs
export const MANAGER_API = {
  CREATE_USER: buildApiUrl(API_CONFIG.MANAGER.CREATE_USER),
  MY_USERS: buildApiUrl(API_CONFIG.MANAGER.MY_USERS),
  DASHBOARD: buildApiUrl(API_CONFIG.MANAGER.DASHBOARD),
  MY_MANAGERS: buildApiUrl(API_CONFIG.MANAGER.MY_MANAGERS),
  USER_ANALYTICS: (id: number) =>
    buildApiUrl(
      API_CONFIG.MANAGER.USER_ANALYTICS.replace(":id", id.toString()),
    ),
  USER_BY_ID: (id: number) =>
    buildApiUrl(API_CONFIG.MANAGER.USER_BY_ID.replace(":id", id.toString())),
  USER_DEACTIVATE: (id: number) =>
    buildApiUrl(
      API_CONFIG.MANAGER.USER_DEACTIVATE.replace(":id", id.toString()),
    ),
  USER_REACTIVATE: (id: number) =>
    buildApiUrl(
      API_CONFIG.MANAGER.USER_REACTIVATE.replace(":id", id.toString()),
    ),
};
