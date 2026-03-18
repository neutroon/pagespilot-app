// Dashboard API service for fetching stats and activity data

import { fetchWithAuth } from "@/services/auth-api";

export interface DashboardStats {
  connectedAccounts: number;
  postsScheduled: number;
  totalReach: number;
}

export interface DashboardActivity {
  id: string;
  type:
    | "post_published"
    | "post_scheduled"
    | "account_connected"
    | "engagement_spike";
  title: string;
  description: string;
  timestamp: string;
  status: "success" | "warning" | "error";
}

export interface DashboardData {
  stats: DashboardStats;
  activities: DashboardActivity[];
}

class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const data = await fetchWithAuth("/v1/dashboard/stats");
      return {
        connectedAccounts: data.connectedAccounts || 0,
        postsScheduled: data.postsScheduled || 0,
        totalReach: data.totalReach || 0,
      };
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      // Return default values if API fails
      return {
        connectedAccounts: 0,
        postsScheduled: 0,
        totalReach: 0,
      };
    }
  }

  async getDashboardActivity(): Promise<DashboardActivity[]> {
    try {
      const data = await fetchWithAuth("/v1/dashboard/activity");
      return data.activities || [];
    } catch (error) {
      console.error("Failed to fetch dashboard activity:", error);
      return [];
    }
  }

  async getDashboardData(): Promise<DashboardData> {
    try {
      const [stats, activities] = await Promise.all([
        this.getDashboardStats(),
        this.getDashboardActivity(),
      ]);

      return {
        stats,
        activities,
      };
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      return {
        stats: {
          connectedAccounts: 0,
          postsScheduled: 0,
          totalReach: 0,
        },
        activities: [],
      };
    }
  }
}

export const dashboardService = new DashboardService();
