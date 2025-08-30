"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, Heart, MessageCircle, Repeat2, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import type { ThreadsPost } from "@/lib/threads-api";
import Image from "next/image";

interface PostCardProps {
  post: ThreadsPost;
}

export function PostCard({ post }: PostCardProps) {
  const postDate = post.timestamp ? new Date(post.timestamp) : new Date();
  
  const getPostTypeColor = (mediaType?: string) => {
    switch (mediaType) {
      case 'IMAGE':
        return 'bg-blue-100 text-blue-800';
      case 'VIDEO':
        return 'bg-purple-100 text-purple-800';
      case 'CAROUSEL_ALBUM':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPostTypeLabel = (mediaType?: string) => {
    switch (mediaType) {
      case 'IMAGE':
        return '画像';
      case 'VIDEO':
        return '動画';
      case 'CAROUSEL_ALBUM':
        return 'アルバム';
      case 'TEXT_POST':
        return 'テキスト';
      default:
        return 'テキスト';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{post.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.username}</p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(postDate, { addSuffix: true, locale: ja })}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className={getPostTypeColor(post.media_type)}>
              {getPostTypeLabel(post.media_type)}
            </Badge>
            {post.permalink && (
              <Button variant="ghost" size="sm" asChild>
                <a 
                  href={post.permalink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {post.text && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {post.text}
          </p>
        )}
        
        {post.media_url && post.media_type === 'IMAGE' && (
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <Image
              src={post.media_url}
              alt="投稿画像"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        
        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
          {typeof post.like_count === 'number' && (
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{post.like_count.toLocaleString()}</span>
            </div>
          )}
          {typeof post.reply_count === 'number' && (
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post.reply_count.toLocaleString()}</span>
            </div>
          )}
          {typeof post.repost_count === 'number' && (
            <div className="flex items-center space-x-1">
              <Repeat2 className="h-4 w-4" />
              <span>{post.repost_count.toLocaleString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}