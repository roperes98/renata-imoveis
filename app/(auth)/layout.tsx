import WideLogo from "@/app/components/WideLogo";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#FFFBFF]">
      {/* Left side - Content */}
      <div className="flex-1 flex flex-col px-4 sm:px-8 lg:px-28 py-6 sm:py-10">
        {/* Content */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-[384px] mx-auto">
          {/* Logo */}
          <Link href="/" className="mb-8 sm:mb-16">
            <WideLogo className="h-10 sm:h-12 w-auto" />
          </Link>

          {children}
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block relative w-[736px] h-screen">
        <Image
          src="/images/login-background.svg"
          alt="Login background"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
