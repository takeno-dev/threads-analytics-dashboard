import { Suspense } from "react";
import { ProfileInfo } from "@/components/profile/profile-info";
import { ProfileSettings } from "@/components/profile/profile-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ProfileLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>プロフィール情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>設定</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">プロフィール</h2>
      </div>
      
      <Suspense fallback={<ProfileLoading />}>
        <div className="space-y-6">
          <ProfileInfo />
          <ProfileSettings />
        </div>
      </Suspense>
    </div>
  );
}