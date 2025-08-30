"use client";

import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Heart, MessageCircle, Repeat2, Quote } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export function TopPostsTable() {
  const { data: analytics, isLoading, error } = api.threads.getAnalytics.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 rounded-lg border p-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">データの取得に失敗しました</p>
      </div>
    );
  }

  const { topPosts } = analytics;

  if (topPosts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">まだ投稿がありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {topPosts.map((post, index) => {
        const totalEngagement = (post.insights?.likes || 0) + 
                              (post.insights?.replies || 0) + 
                              (post.insights?.reposts || 0) + 
                              (post.insights?.quotes || 0);

        return (
          <div key={post.id} className="flex items-start space-x-4 rounded-lg border p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {index + 1}
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm leading-relaxed line-clamp-3">
                {post.content || "投稿内容なし"}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  {post.insights && (
                    <>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{post.insights.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{post.insights.replies}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Repeat2 className="h-3 w-3" />
                        <span>{post.insights.reposts}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Quote className="h-3 w-3" />
                        <span>{post.insights.quotes}</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {totalEngagement} エンゲージメント
                  </Badge>
                  {post.threadsPostId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        window.open(
                          `https://www.threads.net/t/${post.threadsPostId}`,
                          "_blank"
                        );
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.publishedAt), { 
                  addSuffix: true, 
                  locale: ja 
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}