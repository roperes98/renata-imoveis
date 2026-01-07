import DashboardLayoutWrapper from "./components/DashboardLayoutWrapper";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <DashboardLayoutWrapper userEmail={session.user.email || undefined}>
      {children}
    </DashboardLayoutWrapper>
  );
}
