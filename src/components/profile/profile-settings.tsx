"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Unlink, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ProfileSettings() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  
  const { data: isConnected, refetch: refetchConnection } = api.threads.isConnected.useQuery();
  
  const syncMutation = api.threads.syncThreadsData.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message || "同期に失敗しました");
    },
  });

  const disconnectMutation = api.threads.disconnectAccount.useMutation({
    onSuccess: () => {
      toast.success("Threadsアカウントを切断しました");
      refetchConnection();
    },
    onError: (error) => {
      toast.error(error.message || "切断に失敗しました");
    },
  });

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncMutation.mutateAsync();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("本当にThreadsアカウントを切断しますか？")) {
      return;
    }
    
    setIsDisconnecting(true);
    try {
      await disconnectMutation.mutateAsync();
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 接続状態 */}
        <div>
          <h4 className="text-sm font-medium mb-2">接続状態</h4>
          <div className="flex items-center space-x-2">
            {isConnected?.connected ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Threadsアカウントに接続済み</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-600">Threadsアカウントが接続されていません</span>
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* データ同期 */}
        <div>
          <h4 className="text-sm font-medium mb-2">データ同期</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Threadsから最新の投稿データとプロフィール情報を取得します。
          </p>
          <Button
            onClick={handleSync}
            disabled={isSyncing || !isConnected?.connected}
            variant="outline"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? "同期中..." : "データを同期"}
          </Button>
        </div>

        <Separator />

        {/* アカウント管理 */}
        <div>
          <h4 className="text-sm font-medium mb-2">アカウント管理</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Threadsアカウントとの接続を解除します。ローカルに保存されたデータは保持されます。
          </p>
          
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              アカウントを切断すると、新しいデータの取得ができなくなります。
              再度接続するには、OAuth認証を行う必要があります。
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleDisconnect}
            disabled={isDisconnecting || !isConnected?.connected}
            variant="destructive"
          >
            <Unlink className={`mr-2 h-4 w-4 ${isDisconnecting ? 'animate-spin' : ''}`} />
            {isDisconnecting ? "切断中..." : "アカウントを切断"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}