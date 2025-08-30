"use client";

import { api } from "@/trpc/react";
import { PostCard } from "./post-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function PostsList() {
  const { data: posts, isLoading, error } = api.threads.getRecentThreads.useQuery({
    limit: 10
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="flex space-x-4">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          投稿の取得に失敗しました: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!posts?.threads || posts.threads.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">投稿がありません</p>
        <p className="text-sm text-muted-foreground mt-1">
          Threadsで投稿を作成すると、ここに表示されます
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.threads.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}