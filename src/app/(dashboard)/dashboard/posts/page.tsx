import { Suspense } from "react";
import { PostsList } from "@/components/posts/posts-list";
import { CreatePostButton } from "@/components/posts/create-post-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PostsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">投稿管理</h1>
          <p className="text-muted-foreground">
            Threadsの投稿を作成・管理できます
          </p>
        </div>
        <CreatePostButton />
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>最近の投稿</CardTitle>
            <CardDescription>
              あなたのThreads投稿一覧です
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            }>
              <PostsList />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}