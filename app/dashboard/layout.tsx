import DashboardLayoutWrapper from "./components/DashboardLayoutWrapper";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserRoleProvider } from "@/app/context/UserRoleContext";
import RoleGuard from "./components/RoleGuard";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Renata Imóveis | Sistema",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <UserRoleProvider>
      <DashboardLayoutWrapper userEmail={session.user.email || undefined}>
        <RoleGuard>
          {children}
        </RoleGuard>
      </DashboardLayoutWrapper>
    </UserRoleProvider>
  );
}
