import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/server/auth";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Threads Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage your Meta Threads account and analytics
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Welcome to Threads Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              Sign in to access your dashboard and manage your Threads content.
            </p>
          </div>
          
          <form action={async () => {
            "use server";
            await signIn("google");
          }}>
            <Button type="submit" className="w-full h-12 text-base">
              Sign in with Google
            </Button>
          </form>
          
          <div className="text-center text-sm text-gray-500">
            <p>
              Sign in to view your posts, analytics, and manage your Threads presence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
