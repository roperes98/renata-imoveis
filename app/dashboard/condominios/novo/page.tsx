import CondominiumForm from "@/app/components/dashboard/CondominiumForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AddCondominiumPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <CondominiumForm />
        </div>
      </main>
    </div>
  );
}

