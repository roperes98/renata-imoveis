import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { auth } from "@/auth";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
