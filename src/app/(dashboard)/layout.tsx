import { redirect } from "next/navigation"
import { auth } from "@/server/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default async function DashboardLayoutPage({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/")
  }

  return <DashboardLayout>{children}</DashboardLayout>
}