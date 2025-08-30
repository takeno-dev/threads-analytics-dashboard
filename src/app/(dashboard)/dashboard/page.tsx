import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { BarChart3, FileText, Heart, MessageCircle, Users, Link2, Repeat2, Quote, Share, Eye } from "lucide-react"
import { auth } from "@/server/auth"
import { api } from "@/trpc/server"
import { ThreadsCallback } from "./threads-callback"

async function DashboardStats() {
  const session = await auth()
  
  if (!session) {
    return null
  }

  try {
    const analytics = await api.threads.getAnalytics()
    
    const totalPosts = analytics.overview.totalPosts
    const totalLikes = analytics.overview.totalLikes
    const totalReplies = analytics.overview.totalReplies
    const totalViews = analytics.overview.totalViews || 0
    const totalReposts = analytics.overview.totalReposts || 0
    const totalQuotes = analytics.overview.totalQuotes || 0
    const totalShares = analytics.overview.totalShares || 0
    const totalEngagement = analytics.overview.totalEngagement || 0

    const stats = [
      {
        title: "Total Posts",
        value: totalPosts,
        icon: FileText,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Total Likes",
        value: totalLikes,
        icon: Heart,
        color: "text-red-600", 
        bgColor: "bg-red-50",
      },
      {
        title: "Total Replies",
        value: totalReplies,
        icon: MessageCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "Total Views",
        value: totalViews,
        icon: Eye,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
      {
        title: "Total Reposts",
        value: totalReposts,
        icon: Repeat2,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      },
      {
        title: "Total Quotes",
        value: totalQuotes,
        icon: Quote,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      },
      {
        title: "Total Shares",
        value: totalShares,
        icon: Share,
        color: "text-cyan-600",
        bgColor: "bg-cyan-50",
      },
      {
        title: "Total Engagement",
        value: totalEngagement,
        icon: Users,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
      },
    ]

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  } catch (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
}

async function ThreadsConnectionStatus() {
  const session = await auth()
  
  if (!session) {
    return null
  }

  try {
    const connectionStatus = await api.threads.isConnected()
    
    // If already connected, don't show the connection card
    if (connectionStatus.connected) {
      return null
    }
  } catch (error) {
    // If there's an error checking connection status, show the connection card
    console.log("Failed to check connection status:", error)
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Link2 className="h-5 w-5" />
          Threads アカウント接続
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-orange-700 mb-4">
          Threads APIからデータを取得するには、Threadsアカウントを接続してください。
        </p>
        <a href="/api/threads/auth?action=authorize">
          <Button className="w-full">
            <Link2 className="mr-2 h-4 w-4" />
            Threadsアカウントを接続
          </Button>
        </a>
      </CardContent>
    </Card>
  )
}

async function RecentPosts() {
  const session = await auth()
  
  if (!session) {
    return null
  }

  try {
    // First try to get Threads data
    const connectionStatus = await api.threads.isConnected()
    
    if (connectionStatus.connected) {
      // Try to get threads from API
      try {
        const threadsData = await api.threads.getRecentThreads({ limit: 5 })
        
        if (threadsData.threads && threadsData.threads.length > 0) {
          return (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    最近のThreads投稿
                  </span>
                  <Badge variant="outline" className="text-xs">
                    API連携中
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {threadsData.threads.map((thread) => (
                    <div key={thread.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {thread.text || "(メディア投稿)"}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>
                            {thread.timestamp 
                              ? new Date(thread.timestamp).toLocaleDateString("ja-JP")
                              : "日付不明"}
                          </span>
                          {thread.like_count !== undefined && (
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {thread.like_count}
                            </div>
                          )}
                          {thread.reply_count !== undefined && (
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {thread.reply_count}
                            </div>
                          )}
                        </div>
                      </div>
                      {thread.permalink && (
                        <a 
                          href={thread.permalink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Badge variant="outline">表示</Badge>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        }
      } catch (error) {
        console.error("Failed to fetch threads:", error)
      }
    }
    
    // Show empty state if no connection
    const recentPosts: unknown[] = []

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentPosts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No posts yet. Create your first post to get started!
            </p>
          ) : (
            <div className="space-y-4">
              {recentPosts.map((post: any) => (
                <div key={post.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.content || post.text || "(メディア投稿)"}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{new Date(post.createdAt || post.timestamp || new Date()).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.like_count || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {post.reply_count || 0}
                      </div>
                    </div>
                  </div>
                  <Badge variant={post.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                    {post.status || 'PUBLISHED'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  } catch (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-lg border">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }
}

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <ThreadsCallback />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="text-muted-foreground">
          Threads ダッシュボードへようこそ。アクティビティの概要をご覧ください。
        </p>
      </div>
      
      <Suspense fallback={null}>
        <ThreadsConnectionStatus />
      </Suspense>
      
      <Suspense fallback={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <DashboardStats />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        }>
          <RecentPosts />
        </Suspense>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <a
                href="/dashboard/posts/new"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
              >
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Create New Post</p>
                  <p className="text-sm text-muted-foreground">Write and publish a new thread</p>
                </div>
              </a>
              <a
                href="/dashboard/analytics"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
              >
                <BarChart3 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">View Analytics</p>
                  <p className="text-sm text-muted-foreground">Check your post performance</p>
                </div>
              </a>
              <a
                href="/dashboard/profile"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
              >
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Update Profile</p>
                  <p className="text-sm text-muted-foreground">Manage your profile information</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}