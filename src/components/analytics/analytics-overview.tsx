"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MessageCircle, Repeat2, Quote, BarChart3, TrendingUp, FileText } from "lucide-react";

export function AnalyticsOverview() {
  const { data: analytics, isLoading, error } = api.threads.getAnalytics.useQuery();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">読み込み中...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">データを取得中</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            アナリティクスデータの取得に失敗しました
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  const { overview } = analytics;

  const stats = [
    {
      title: "総投稿数",
      value: overview.totalPosts.toLocaleString(),
      icon: FileText,
      description: "これまでの投稿数",
    },
    {
      title: "総いいね数",
      value: overview.totalLikes.toLocaleString(),
      icon: Heart,
      description: "すべての投稿の合計",
    },
    {
      title: "総リプライ数",
      value: overview.totalReplies.toLocaleString(),
      icon: MessageCircle,
      description: "すべての投稿の合計",
    },
    {
      title: "総リポスト数",
      value: overview.totalReposts.toLocaleString(),
      icon: Repeat2,
      description: "すべての投稿の合計",
    },
    {
      title: "総引用数",
      value: overview.totalQuotes.toLocaleString(),
      icon: Quote,
      description: "すべての投稿の合計",
    },
    {
      title: "総エンゲージメント",
      value: overview.totalEngagement.toLocaleString(),
      icon: BarChart3,
      description: "いいね+リプライ+リポスト+引用",
    },
    {
      title: "平均エンゲージメント",
      value: overview.averageEngagement.toLocaleString(),
      icon: TrendingUp,
      description: "投稿あたりの平均",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}