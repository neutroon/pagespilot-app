// Facebook API Service for Production-Ready Integration
import { FACEBOOK_API } from "./config";

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  followers_count?: number;
  picture?: {
    data: {
      url: string;
    };
  };
}

interface FacebookPost {
  id: string;
  message: string;
  created_time: string;
  permalink_url: string;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
}

interface FacebookAnalytics {
  page_impressions: number;
  page_reach: number;
  page_engaged_users: number;
  page_post_engagements: number;
}

class FacebookAPIService {
  private baseURL: string;
  private apiVersion: string;

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_FACEBOOK_API_URL || "https://graph.facebook.com";
    this.apiVersion = "v25.0";
  }

  // Get Facebook OAuth URL
  async getAuthUrl(redirectUri: string): Promise<string> {
    const response = await fetch(
      `${FACEBOOK_API.LOGIN}?redirect_uri=${encodeURIComponent(redirectUri)}`,
      {
        method: "GET",
        credentials: "include", // Include cookies for authentication

        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to get Facebook auth URL");
    }

    const data = await response.json();
    return data.authUrl;
  }

  // Exchange code for access token
  async exchangeCodeForToken(
    code: string,
    redirectUri: string,
  ): Promise<{ access_token: string }> {
    const response = await fetch(FACEBOOK_API.CALLBACK, {
      method: "GET",
      credentials: "include", // Include cookies for authentication

      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to exchange code for token");
    }

    return await response.json();
  }

  // Get user's Facebook pages
  async getPages(accessToken: string): Promise<FacebookPage[]> {
    const response = await fetch(
      `${this.baseURL}/${this.apiVersion}/me/accounts?access_token=${accessToken}&fields=id,name,access_token,category,followers_count,picture`,
      {
        credentials: "include", // Include cookies for authentication
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Facebook pages");
    }

    const data = await response.json();
    return data.data || [];
  }

  // Get page details
  async getPageDetails(
    pageId: string,
    pageAccessToken: string,
  ): Promise<FacebookPage> {
    const response = await fetch(
      `${this.baseURL}/${this.apiVersion}/${pageId}?access_token=${pageAccessToken}&fields=id,name,category,followers_count,picture`,
      {
        credentials: "include", // Include cookies for authentication
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch page details");
    }

    return await response.json();
  }

  // Create a post on Facebook page
  async createPost(
    pageId: string,
    pageAccessToken: string,
    message: string,
    link?: string,
    scheduledPublishTime?: number,
  ): Promise<{ id: string }> {
    const postData: any = {
      message,
      access_token: pageAccessToken,
    };

    if (link) {
      postData.link = link;
    }

    if (scheduledPublishTime) {
      postData.scheduled_publish_time = scheduledPublishTime;
      postData.published = false;
    }

    const response = await fetch(
      `${this.baseURL}/${this.apiVersion}/${pageId}/feed`,
      {
        method: "POST",
        credentials: "include", // Include cookies for authentication
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(postData),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to create post");
    }

    return await response.json();
  }

  // Get page posts
  async getPagePosts(
    pageId: string,
    pageAccessToken: string,
    limit: number = 25,
  ): Promise<FacebookPost[]> {
    const response = await fetch(
      `${this.baseURL}/${this.apiVersion}/${pageId}/posts?access_token=${pageAccessToken}&fields=id,message,created_time,permalink_url,likes.summary(true),comments.summary(true),shares&limit=${limit}`,
      {
        credentials: "include", // Include cookies for authentication
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch page posts");
    }

    const data = await response.json();
    return data.data || [];
  }

  // Get page analytics
  async getPageAnalytics(
    pageId: string,
    pageAccessToken: string,
    since?: string,
    until?: string,
  ): Promise<FacebookAnalytics> {
    const metrics =
      "page_impressions,page_reach,page_engaged_users,page_post_engagements";
    let url = `${this.baseURL}/${this.apiVersion}/${pageId}/insights?access_token=${pageAccessToken}&metric=${metrics}`;

    if (since) {
      url += `&since=${since}`;
    }
    if (until) {
      url += `&until=${until}`;
    }

    const response = await fetch(url, {
      credentials: "include", // Include cookies for authentication
    });

    if (!response.ok) {
      throw new Error("Failed to fetch page analytics");
    }

    const data = await response.json();
    return data.data || {};
  }

  // Get page comments
  async getPageComments(
    pageId: string,
    pageAccessToken: string,
    postId: string,
  ): Promise<any[]> {
    const response = await fetch(
      `${this.baseURL}/${this.apiVersion}/${postId}/comments?access_token=${pageAccessToken}&fields=id,message,from,created_time,like_count`,
      {
        credentials: "include", // Include cookies for authentication
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch comments");
    }

    const data = await response.json();
    return data.data || [];
  }

  // Reply to comment
  async replyToComment(
    commentId: string,
    pageAccessToken: string,
    message: string,
  ): Promise<{ id: string }> {
    const response = await fetch(
      `${this.baseURL}/${this.apiVersion}/${commentId}/comments`,
      {
        method: "POST",
        credentials: "include", // Include cookies for authentication
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          message,
          access_token: pageAccessToken,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to reply to comment");
    }

    return await response.json();
  }

  // Get page messages (if page has messaging enabled)
  async getPageMessages(
    pageId: string,
    pageAccessToken: string,
  ): Promise<any[]> {
    const response = await fetch(
      `${this.baseURL}/${this.apiVersion}/${pageId}/conversations?access_token=${pageAccessToken}&fields=id,updated_time,message_count`,
      {
        credentials: "include", // Include cookies for authentication
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch page messages");
    }

    const data = await response.json();
    return data.data || [];
  }

  // Send message to user
  async sendMessage(
    pageId: string,
    pageAccessToken: string,
    recipientId: string,
    message: string,
  ): Promise<{ id: string }> {
    const response = await fetch(
      `${this.baseURL}/${this.apiVersion}/me/messages`,
      {
        method: "POST",
        credentials: "include", // Include cookies for authentication
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: message },
          access_token: pageAccessToken,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to send message");
    }

    return await response.json();
  }

  // Schedule post
  async schedulePost(
    pageId: string,
    pageAccessToken: string,
    message: string,
    scheduledTime: Date,
    link?: string,
  ): Promise<{ id: string }> {
    const scheduledPublishTime = Math.floor(scheduledTime.getTime() / 1000);
    return this.createPost(
      pageId,
      pageAccessToken,
      message,
      link,
      scheduledPublishTime,
    );
  }

  // Get scheduled posts
  async getScheduledPosts(
    pageId: string,
    pageAccessToken: string,
  ): Promise<FacebookPost[]> {
    const response = await fetch(
      `${this.baseURL}/${this.apiVersion}/${pageId}/scheduled_posts?access_token=${pageAccessToken}&fields=id,message,created_time,scheduled_publish_time`,
      {
        credentials: "include", // Include cookies for authentication
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch scheduled posts");
    }

    const data = await response.json();
    return data.data || [];
  }

  // Delete post
  async deletePost(postId: string, pageAccessToken: string): Promise<boolean> {
    const response = await fetch(
      `${this.baseURL}/${this.apiVersion}/${postId}`,
      {
        method: "DELETE",
        credentials: "include", // Include cookies for authentication
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          access_token: pageAccessToken,
        }),
      },
    );

    return response.ok;
  }

  // Validate access token
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseURL}/${this.apiVersion}/me?access_token=${accessToken}`,
        {
          credentials: "include", // Include cookies for authentication
        },
      );
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const facebookAPI = new FacebookAPIService();
export type { FacebookPage, FacebookPost, FacebookAnalytics };
