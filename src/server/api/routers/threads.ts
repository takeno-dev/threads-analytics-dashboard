import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createThreadsClient, type ThreadsPost } from "@/lib/threads-api";
import { TRPCError } from "@trpc/server";

// Debug: Check environment variables on startup
console.log("Threads Router Init - Env Check:", {
  NODE_ENV: process.env.NODE_ENV,
  HAS_THREADS_ACCESS_TOKEN: !!process.env.THREADS_ACCESS_TOKEN,
  THREADS_ACCESS_TOKEN_PREFIX: process.env.THREADS_ACCESS_TOKEN?.substring(0, 20) + "..."
});

export const threadsRouter = createTRPCRouter({
  /**
   * Get current user's Threads profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get user's Threads access token from database or use environment variable for development
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { threadsAccessToken: true, threadsUserId: true },
      });

      let accessToken = user?.threadsAccessToken;
      
      // Fall back to environment variable for development
      if (!accessToken && process.env.NODE_ENV === "development") {
        accessToken = process.env.THREADS_ACCESS_TOKEN;
      }

      if (!accessToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Threads account not connected. Please connect your Threads account first.",
        });
      }

      const client = createThreadsClient(accessToken);
      const profile = await client.getUserProfile(user?.threadsUserId || "me");

      // Update user profile in database
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          threadsUserId: profile.id,
          username: profile.username,
          profileImageUrl: profile.threads_profile_picture_url,
        },
      });

      return profile;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch Threads profile",
      });
    }
  }),

  /**
   * Get user's recent threads
   */
  getRecentThreads: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(25),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Get user's Threads access token from database or use environment variable for development
        const user = await ctx.db.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { threadsAccessToken: true, threadsUserId: true },
        });

        let accessToken = user?.threadsAccessToken;
        
        // Fall back to environment variable for development
        if (!accessToken && process.env.NODE_ENV === "development") {
          accessToken = process.env.THREADS_ACCESS_TOKEN;
        }

        if (!accessToken) {
          // Return mock data for development
          if (process.env.NODE_ENV === "development") {
            return {
              threads: [] as ThreadsPost[],
              nextCursor: null,
              hasMore: false,
            };
          }
          
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Threads account not connected. Please connect your Threads account first.",
          });
        }

        console.log("Creating Threads client with token:", accessToken?.substring(0, 20) + "...");
        
        const client = createThreadsClient(accessToken);
        
        console.log("Fetching threads for user:", user?.threadsUserId || "me");
        
        const response = await client.getUserThreads(
          user?.threadsUserId || "me",
          input.limit,
          input.cursor
        );
        
        console.log("Threads response:", response);

        // Save threads to database
        if (response.data && response.data.length > 0) {
          await Promise.all(
            response.data.map(async (thread) => {
              // Debug: Log engagement metrics from API
              console.log(`Thread ${thread.id} metrics:`, {
                like_count: thread.like_count,
                reply_count: thread.reply_count,
                repost_count: thread.repost_count,
                quote_count: thread.quote_count,
              });

              // Convert media_type to PostType enum
              const postType = thread.media_type === 'IMAGE' ? 'IMAGE' : 
                             thread.media_type === 'VIDEO' ? 'VIDEO' : 'TEXT';
              
              // Convert media_url to mediaUrls array format
              const mediaUrls = thread.media_url ? [thread.media_url] : undefined;

              await ctx.db.post.upsert({
                where: {
                  threadsPostId: thread.id,
                },
                update: {
                  content: thread.text || "",
                  postType: postType,
                  mediaUrls: mediaUrls,
                  publishedAt: thread.timestamp ? new Date(thread.timestamp) : new Date(),
                  likes: thread.like_count || 0,
                  replies: thread.reply_count || 0,
                  reposts: thread.repost_count || 0,
                  quotes: thread.quote_count || 0,
                  updatedAt: new Date(),
                },
                create: {
                  userId: ctx.session.user.id,
                  threadsPostId: thread.id,
                  content: thread.text || "",
                  postType: postType,
                  mediaUrls: mediaUrls,
                  status: "PUBLISHED",
                  publishedAt: thread.timestamp ? new Date(thread.timestamp) : new Date(),
                  likes: thread.like_count || 0,
                  replies: thread.reply_count || 0,
                  reposts: thread.repost_count || 0,
                  quotes: thread.quote_count || 0,
                },
              });

            })
          );
        }

        return {
          threads: response.data,
          nextCursor: response.paging?.cursors?.after || null,
          hasMore: !!response.paging?.next,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch threads",
        });
      }
    }),

  /**
   * Sync all threads data
   */
  syncThreadsData: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { threadsAccessToken: true, threadsUserId: true },
      });

      let accessToken = user?.threadsAccessToken;
      
      // Fall back to environment variable for development
      if (!accessToken && process.env.NODE_ENV === "development") {
        accessToken = process.env.THREADS_ACCESS_TOKEN;
      }

      if (!accessToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Threads account not connected",
        });
      }

      const client = createThreadsClient(accessToken);
      
      // Fetch profile
      const profile = await client.getUserProfile(user?.threadsUserId || "me");
      
      // Update user profile
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          threadsUserId: profile.id,
          username: profile.username,
          profileImageUrl: profile.threads_profile_picture_url,
        },
      });

      // Fetch recent threads
      let hasMore = true;
      let cursor: string | undefined;
      let totalSynced = 0;

      while (hasMore && totalSynced < 100) {
        const response = await client.getUserThreads(
          user?.threadsUserId || "me",
          25,
          cursor
        );

        if (response.data && response.data.length > 0) {
          // Save threads to database
          await Promise.all(
            response.data.map(async (thread) => {
              // Convert media_type to PostType enum
              const postType = thread.media_type === 'IMAGE' ? 'IMAGE' : 
                             thread.media_type === 'VIDEO' ? 'VIDEO' : 'TEXT';
              
              // Convert media_url to mediaUrls array format
              const mediaUrls = thread.media_url ? [thread.media_url] : undefined;

              await ctx.db.post.upsert({
                where: {
                  threadsPostId: thread.id,
                },
                update: {
                  content: thread.text || "",
                  postType: postType,
                  mediaUrls: mediaUrls,
                  publishedAt: thread.timestamp ? new Date(thread.timestamp) : new Date(),
                  likes: thread.like_count || 0,
                  replies: thread.reply_count || 0,
                  reposts: thread.repost_count || 0,
                  quotes: thread.quote_count || 0,
                  updatedAt: new Date(),
                },
                create: {
                  userId: ctx.session.user.id,
                  threadsPostId: thread.id,
                  content: thread.text || "",
                  postType: postType,
                  mediaUrls: mediaUrls,
                  status: "PUBLISHED",
                  publishedAt: thread.timestamp ? new Date(thread.timestamp) : new Date(),
                  likes: thread.like_count || 0,
                  replies: thread.reply_count || 0,
                  reposts: thread.repost_count || 0,
                  quotes: thread.quote_count || 0,
                },
              });
            })
          );

          totalSynced += response.data.length;
        }

        hasMore = !!response.paging?.next;
        cursor = response.paging?.cursors?.after;
      }

      return {
        success: true,
        message: `Successfully synced ${totalSynced} threads`,
        syncedCount: totalSynced,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to sync threads data",
      });
    }
  }),

  /**
   * Connect Threads account (placeholder for OAuth flow)
   */
  connectAccount: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("connectAccount called with token:", input.accessToken.substring(0, 20) + "...");
        
        // Verify the access token by fetching profile
        const client = createThreadsClient(input.accessToken);
        console.log("Created Threads client, fetching profile...");
        
        const profile = await client.getUserProfile("me");
        console.log("Profile fetched successfully:", profile.username);

        // Save the access token and profile info
        await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: {
            threadsAccessToken: input.accessToken,
            threadsUserId: profile.id,
            username: profile.username,
            profileImageUrl: profile.threads_profile_picture_url,
          },
        });

        console.log("User updated successfully with Threads data");

        return {
          success: true,
          message: "Threads account connected successfully",
          profile,
        };
      } catch (error) {
        console.error("❌ connectAccount error:", error);
        console.error("Error details:", {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack'
        });
        
        // Return specific error for UNAUTHORIZED issues
        if (error instanceof Error && error.message.includes('401')) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid Threads access token. Please try connecting your account again.",
          });
        }
        
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to connect Threads account",
        });
      }
    }),

  /**
   * Disconnect Threads account
   */
  disconnectAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: {
        threadsAccessToken: null,
        threadsUserId: null,
      },
    });

    return {
      success: true,
      message: "Threads account disconnected",
    };
  }),

  /**
   * Check if Threads account is connected
   */
  isConnected: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        threadsAccessToken: true,
        threadsUserId: true,
        username: true,
        profileImageUrl: true,
      },
    });

    const hasToken = !!(user?.threadsAccessToken || 
      (process.env.NODE_ENV === "development" && process.env.THREADS_ACCESS_TOKEN));
    
    console.log("isConnected check:", {
      hasUserToken: !!user?.threadsAccessToken,
      hasEnvToken: !!(process.env.NODE_ENV === "development" && process.env.THREADS_ACCESS_TOKEN),
      envMode: process.env.NODE_ENV,
      finalConnected: hasToken
    });
    
    return {
      connected: hasToken,
      username: user?.username,
      profileImageUrl: user?.profileImageUrl,
    };
  }),

  /**
   * Get analytics overview
   */
  getAnalytics: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get user's access token for API calls
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { threadsAccessToken: true, threadsUserId: true },
      });

      let accessToken = user?.threadsAccessToken;
      
      // Fall back to environment variable for development
      if (!accessToken && process.env.NODE_ENV === "development") {
        accessToken = process.env.THREADS_ACCESS_TOKEN;
      }

      const posts = await ctx.db.post.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { publishedAt: "desc" },
      });

      let totalViews = 0;
      let totalShares = 0;

      // Try to update insights data from API if access token is available
      if (accessToken) {
        console.log("📊 Updating insights data from Threads API...");
        const client = createThreadsClient(accessToken);
        
        // Update insights for recent posts (limit to avoid rate limiting and focus on recent data)
        const recentPosts = posts
          .filter(post => {
            const postDate = post.publishedAt || post.createdAt;
            const daysDiff = (Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysDiff <= 30; // Only process posts from last 30 days
          })
          .slice(0, 10); // Reduced from 20 to 10 to avoid rate limits
        
        for (const post of recentPosts) {
          if (post.threadsPostId) {
            try {
              console.log(`🔄 Fetching insights for post ${post.threadsPostId}...`);
              
              const insights = await client.getThreadInsights(post.threadsPostId, ["views", "likes", "replies", "reposts", "quotes"]);
              
              // Parse insights data
              let views = 0, likes = 0, replies = 0, reposts = 0, quotes = 0;
              
              insights.data.forEach(metric => {
                const value = metric.values[0]?.value || 0;
                switch (metric.name) {
                  case 'views': views = value; break;
                  case 'likes': likes = value; break;
                  case 'replies': replies = value; break;
                  case 'reposts': reposts = value; break;
                  case 'quotes': quotes = value; break;
                }
              });
              
              console.log(`✅ Post ${post.threadsPostId} insights:`, { views, likes, replies, reposts, quotes });
              
              // Update post in database
              await ctx.db.post.update({
                where: { id: post.id },
                data: {
                  views,
                  likes,
                  replies,
                  reposts,
                  quotes,
                  updatedAt: new Date(),
                },
              });
              
              // Small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 100));
              
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              
              // Skip posts that no longer exist or have permission issues
              if (errorMessage.includes('does not exist') || 
                  errorMessage.includes('missing permissions') || 
                  errorMessage.includes('Unsupported get request')) {
                console.log(`⏭️ Skipping inaccessible post ${post.threadsPostId}: ${errorMessage}`);
              } else {
                console.log(`⚠️ Failed to fetch insights for post ${post.threadsPostId}:`, errorMessage);
              }
            }
          }
        }
        
        // Fetch updated posts data
        const updatedPosts = await ctx.db.post.findMany({
          where: { userId: ctx.session.user.id },
          orderBy: { publishedAt: "desc" },
        });
        posts.splice(0, posts.length, ...updatedPosts);
        console.log("✅ Insights data updated from API");
      } else {
        console.log("ℹ️ Using existing insights data from database (no access token available)");
      }

      // Debug: Log posts data
      console.log("Posts data sample:", posts.slice(0, 2).map(p => ({
        id: p.id,
        likes: p.likes,
        replies: p.replies,
        reposts: p.reposts,
        quotes: p.quotes,
        views: p.views
      })));

      const totalPosts = posts.length;
      const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
      const totalReplies = posts.reduce((sum, post) => sum + (post.replies || 0), 0);
      const totalReposts = posts.reduce((sum, post) => sum + (post.reposts || 0), 0);
      const totalQuotes = posts.reduce((sum, post) => sum + (post.quotes || 0), 0);
      totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
      totalShares = 0; // Not available in basic API

      // Debug: Log calculated totals
      console.log("Calculated totals:", {
        totalPosts,
        totalLikes,
        totalReplies,
        totalReposts,
        totalQuotes,
        totalViews,
        totalShares
      });

      const totalEngagement = totalLikes + totalReplies + totalReposts + totalQuotes;
      const averageEngagement = totalPosts > 0 ? Math.round(totalEngagement / totalPosts) : 0;

      // Get top performing posts
      const topPosts = posts
        .sort((a, b) => {
          const engagementA = (a.likes || 0) + (a.replies || 0) + (a.reposts || 0) + (a.quotes || 0);
          const engagementB = (b.likes || 0) + (b.replies || 0) + (b.reposts || 0) + (b.quotes || 0);
          return engagementB - engagementA;
        })
        .slice(0, 5);

      // Get engagement over time (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentPosts = await ctx.db.post.findMany({
        where: {
          userId: ctx.session.user.id,
          publishedAt: { gte: thirtyDaysAgo },
        },
        orderBy: { publishedAt: "asc" },
      });

      // Group by day for chart
      const engagementByDay: { date: string; likes: number; replies: number; reposts: number; quotes: number }[] = [];
      const dailyMap = new Map<string, { likes: number; replies: number; reposts: number; quotes: number }>();

      recentPosts.forEach(post => {
        const dateKey = (post.publishedAt || new Date()).toISOString().split('T')[0];
        const existing = dailyMap.get(dateKey) || { likes: 0, replies: 0, reposts: 0, quotes: 0 };
        
        existing.likes += post.likes || 0;
        existing.replies += post.replies || 0;
        existing.reposts += post.reposts || 0;
        existing.quotes += post.quotes || 0;
        
        dailyMap.set(dateKey, existing);
      });

      // Convert to array and fill missing days with 0 (ensure even spacing)
      const today = new Date();
      const engagementData = [];
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000)); // Subtract exact days in milliseconds
        const dateKey = date.toISOString().split('T')[0];
        const data = dailyMap.get(dateKey) || { likes: 0, replies: 0, reposts: 0, quotes: 0 };
        
        engagementData.push({
          date: dateKey,
          ...data,
        });
      }
      
      // Assign the properly ordered data
      engagementByDay.push(...engagementData);

      return {
        overview: {
          totalPosts,
          totalLikes,
          totalReplies,
          totalReposts,
          totalQuotes,
          totalViews,
          totalShares,
          totalEngagement,
          averageEngagement,
        },
        topPosts: topPosts.map(post => ({
          id: post.id,
          content: post.content,
          publishedAt: post.publishedAt || new Date(),
          threadsPostId: post.threadsPostId,
          likes: post.likes,
          replies: post.replies,
          reposts: post.reposts,
          quotes: post.quotes,
          views: post.views,
        })),
        engagementByDay,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch analytics",
      });
    }
  }),
});