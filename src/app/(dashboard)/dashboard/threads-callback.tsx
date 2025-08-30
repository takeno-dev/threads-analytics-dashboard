"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export function ThreadsCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const connectMutation = api.threads.connectAccount.useMutation();

  useEffect(() => {
    const token = searchParams.get("threads_token");
    const userId = searchParams.get("threads_user_id");
    const error = searchParams.get("threads_error");

    console.log("🔍 ThreadsCallback useEffect triggered:", {
      hasToken: !!token,
      hasUserId: !!userId,
      hasError: !!error,
      tokenPrefix: token ? token.substring(0, 20) + "..." : "null",
      userIdValue: userId || "null",
      errorValue: error || "null",
      mutationPending: connectMutation.isPending,
      currentUrl: window.location.href
    });

    if (error) {
      console.log("❌ Threads OAuth error detected:", error);
      toast.error(`Threads接続エラー: ${error}`);
      // Remove error params from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("threads_error");
      router.replace(newUrl.pathname + newUrl.search);
      return;
    }

    if (token && !connectMutation.isPending) {
      console.log("✅ Processing Threads token:", token.substring(0, 20) + "...");
      console.log("📝 Calling connectMutation with:", { accessToken: token.substring(0, 20) + "..." });
      
      connectMutation.mutate(
        { accessToken: token },
        {
          onSuccess: (data) => {
            toast.success("Threadsアカウントが正常に接続されました！");
            console.log("✅ Threads connection successful:", data);
            
            // Remove token params from URL for security
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("threads_token");
            newUrl.searchParams.delete("threads_user_id");
            newUrl.searchParams.delete("threads_expires_in");
            router.replace(newUrl.pathname + newUrl.search);
            
            // Refresh the page to update connection status
            window.location.reload();
          },
          onError: (error) => {
            toast.error(`接続に失敗しました: ${error.message}`);
            console.error("❌ Threads connection error:", error);
            
            // Remove token params from URL
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("threads_token");
            newUrl.searchParams.delete("threads_user_id");
            newUrl.searchParams.delete("threads_expires_in");
            router.replace(newUrl.pathname + newUrl.search);
          },
        }
      );
    } else if (!token) {
      console.log("⚠️ No threads_token found in URL parameters");
    } else if (connectMutation.isPending) {
      console.log("⏳ Mutation already pending, skipping");
    }
  }, [searchParams, router]);

  return null; // This component only handles side effects
}