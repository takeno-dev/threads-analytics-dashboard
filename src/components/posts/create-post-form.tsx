"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";

const createPostSchema = z.object({
  content: z
    .string()
    .min(1, "投稿内容を入力してください")
    .max(500, "投稿は500文字以内で入力してください"),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

interface CreatePostFormProps {
  onSuccess?: () => void;
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: "",
    },
  });

  const watchedContent = form.watch("content");
  const characterCount = watchedContent.length;
  const isNearLimit = characterCount > 450;
  const isOverLimit = characterCount > 500;

  const onSubmit = async (data: CreatePostFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Implement actual post creation API call
      // This would integrate with Threads API for creating posts
      
      // Simulated API call for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, we'll just show a message that this feature is coming soon
      toast.info("投稿作成機能は現在開発中です。Threads APIの投稿エンドポイントが利用可能になり次第実装します。");
      
      form.reset();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "投稿の作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>投稿内容</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="今何を考えていますか？"
                    className="min-h-[120px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="flex justify-between items-center">
                  <span>Threadsに投稿される内容を入力してください</span>
                  <span className={`text-sm ${isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                    {characterCount}/500
                  </span>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>注意:</strong> 投稿作成機能は現在開発中です。Threads APIの投稿エンドポイントが正式に利用可能になり次第、実装を完了します。
            </AlertDescription>
          </Alert>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              リセット
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isOverLimit || !watchedContent.trim()}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              投稿する
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}