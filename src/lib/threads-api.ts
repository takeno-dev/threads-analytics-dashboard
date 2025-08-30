import { env } from "@/env.js";

export interface ThreadsPost {
  id: string;
  text?: string;
  media_type?: "TEXT" | "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  permalink?: string;
  timestamp?: string;
  username?: string;
  like_count?: number;
  reply_count?: number;
  repost_count?: number;
  quote_count?: number;
  children?: {
    data: ThreadsPost[];
  };
}

export interface ThreadsUser {
  id: string;
  username?: string;
  threads_profile_picture_url?: string;
  threads_biography?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
}

export interface ThreadsPaginatedResponse<T> {
  data: T[];
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
    previous?: string;
  };
}

export interface ThreadsInsights {
  data: {
    name: string;
    period: string;
    values: {
      value: number;
    }[];
    title: string;
    description: string;
    id: string;
  }[];
}

class ThreadsAPIClient {
  private baseUrl = "https://graph.threads.net";
  private apiVersion = "v1.0";

  constructor(private accessToken: string) {
    console.log("🔧 Creating Threads API client with token:", accessToken.substring(0, 20) + "...");
  }

  private async fetchAPI<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}/${this.apiVersion}${endpoint}`);
    
    // Add access token
    url.searchParams.append("access_token", this.accessToken);
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      console.log("🌐 Threads API Request:", url.toString().replace(this.accessToken, '[TOKEN]'));
      
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📊 Threads API Response Status:", response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Threads API Error Response:", errorText);
        
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = {
            error: {
              message: `HTTP ${response.status}: ${response.statusText}`,
              type: "http_error",
              code: response.status,
              raw_response: errorText
            }
          };
        }
        
        const errorMessage = error.error?.message || `Failed to fetch from Threads API (${response.status})`;
        console.error("🔥 Parsed error:", error);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("✅ Threads API Response Data:", JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error("💥 Threads API Error:", error);
      throw error;
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(userId: string = "me"): Promise<ThreadsUser> {
    const fields = [
      "id",
      "username",
      "threads_profile_picture_url",
      "threads_biography",
    ].join(",");

    return this.fetchAPI<ThreadsUser>(`/${userId}`, { fields });
  }

  /**
   * Get user's threads posts
   */
  async getUserThreads(
    userId: string = "me",
    limit: number = 25,
    after?: string
  ): Promise<ThreadsPaginatedResponse<ThreadsPost>> {
    const fields = [
      "id",
      "text",
      "media_type",
      "media_url",
      "permalink",
      "timestamp",
      "username",
      "like_count",
      "reply_count",
      "repost_count",
      "quote_count",
      "children{id,text,media_type,media_url,permalink,timestamp}",
    ].join(",");

    const params: Record<string, string> = {
      fields,
      limit: limit.toString(),
    };

    if (after) {
      params.after = after;
    }

    return this.fetchAPI<ThreadsPaginatedResponse<ThreadsPost>>(
      `/${userId}/threads`,
      params
    );
  }

  /**
   * Get a specific thread post
   */
  async getThread(threadId: string): Promise<ThreadsPost> {
    const fields = [
      "id",
      "text",
      "media_type",
      "media_url",
      "permalink",
      "timestamp",
      "username",
      "like_count",
      "reply_count",
      "repost_count",
      "quote_count",
      "children{id,text,media_type,media_url,permalink,timestamp}",
    ].join(",");

    return this.fetchAPI<ThreadsPost>(`/${threadId}`, { fields });
  }

  /**
   * Get thread insights (metrics)
   */
  async getThreadInsights(
    threadId: string,
    metrics: string[] = ["views", "likes", "replies", "reposts", "quotes", "shares"]
  ): Promise<ThreadsInsights> {
    const metric = metrics.join(",");
    return this.fetchAPI<ThreadsInsights>(`/${threadId}/insights`, {
      metric,
    });
  }

  /**
   * Get user insights (account-level metrics)
   */
  async getUserInsights(
    userId: string = "me",
    metrics: string[] = ["views", "likes", "replies", "reposts", "quotes", "shares", "follower_count", "follower_demographics"]
  ): Promise<ThreadsInsights> {
    const metric = metrics.join(",");
    return this.fetchAPI<ThreadsInsights>(`/${userId}/insights`, {
      metric,
    });
  }

  /**
   * Get user mentions
   */
  async getUserMentions(
    userId: string = "me",
    limit: number = 25
  ): Promise<ThreadsPaginatedResponse<ThreadsPost>> {
    const fields = [
      "id",
      "text",
      "media_type",
      "media_url",
      "permalink",
      "timestamp",
      "username",
    ].join(",");

    return this.fetchAPI<ThreadsPaginatedResponse<ThreadsPost>>(
      `/${userId}/mentions`,
      {
        fields,
        limit: limit.toString(),
      }
    );
  }

  /**
   * Search for threads by keyword (if available)
   */
  async searchThreads(
    query: string,
    limit: number = 25
  ): Promise<ThreadsPaginatedResponse<ThreadsPost>> {
    const fields = [
      "id",
      "text",
      "media_type",
      "media_url",
      "permalink",
      "timestamp",
      "username",
      "like_count",
      "reply_count",
    ].join(",");

    return this.fetchAPI<ThreadsPaginatedResponse<ThreadsPost>>("/search", {
      q: query,
      type: "thread",
      fields,
      limit: limit.toString(),
    });
  }
}

/**
 * Create a Threads API client instance
 * @param accessToken - User's Threads access token
 */
export function createThreadsClient(accessToken: string) {
  return new ThreadsAPIClient(accessToken);
}

/**
 * Get Threads API client for server-side usage
 * Uses environment variable THREADS_ACCESS_TOKEN for development
 */
export async function getServerThreadsClient() {
  // For development, use environment variable if available
  if (env.THREADS_ACCESS_TOKEN) {
    return new ThreadsAPIClient(env.THREADS_ACCESS_TOKEN);
  }
  
  // TODO: Implement fetching user's Threads access token from database
  throw new Error(
    "Threads access token not found. Set THREADS_ACCESS_TOKEN environment variable or connect user's account."
  );
}