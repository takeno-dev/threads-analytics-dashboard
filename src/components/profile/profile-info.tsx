"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ProfileInfo() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: profile, isLoading, refetch } = api.threads.getProfile.useQuery(
    undefined,
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const { data: isConnected } = api.threads.isConnected.useQuery();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("プロフィール情報を更新しました");
    } catch (error) {
      toast.error("更新に失敗しました");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>プロフィール情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected?.connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>プロフィール情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Threadsアカウントが接続されていません</h3>
            <p className="mt-2 text-muted-foreground">
              プロフィール情報を表示するには、まずThreadsアカウントを接続してください。
            </p>
            <Button className="mt-4" onClick={() => window.location.href = "/dashboard"}>
              アカウントを接続
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>プロフィール情報</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          更新
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage 
              src={profile.threads_profile_picture_url} 
              alt={profile.username} 
            />
            <AvatarFallback className="text-lg">
              {profile.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <h3 className="text-2xl font-bold">@{profile.username}</h3>
              <Badge variant="secondary">
                <ExternalLink className="mr-1 h-3 w-3" />
                Threads
              </Badge>
            </div>
            
            {profile.threads_biography && (
              <p className="text-muted-foreground leading-relaxed">
                {profile.threads_biography}
              </p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div>ID: {profile.id}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              window.open(`https://www.threads.net/@${profile.username}`, "_blank");
            }}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Threadsで表示
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}