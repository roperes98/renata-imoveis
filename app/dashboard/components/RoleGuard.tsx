"use client";

import { useUserRole } from "@/app/context/UserRoleContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ROUTE_PERMISSIONS, DEFAULT_REDIRECT } from "@/app/config/permissions";

export default function RoleGuard({ children }: { children: React.ReactNode }) {
  const { role } = useUserRole();
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if the current path matches any permission rule
    // We check for exact match or if the permission path is a prefix of the current path
    // But we need to be careful with specificity. 
    // For this simple case, we iterate and find the best match or check all applicable.

    // Simplification: Check exact startsWith for the defined routes.
    // If multiple match, we take the most specific one ideally, but since our paths are distinct enough:

    let isAllowed = true;

    // Find the most specific permission that matches the current path
    const matchingPermissionFn = () => {
      // Sort permissions by length descending to match most specific first
      const sortedPermissions = Object.keys(ROUTE_PERMISSIONS).sort((a, b) => b.length - a.length);

      for (const route of sortedPermissions) {
        if (pathname === route || pathname.startsWith(`${route}/`)) {
          return ROUTE_PERMISSIONS[route].includes(role);
        }
      }
      // If no specific route defined (e.g. just /dashboard/unknown), default to allowed or restricted?
      // Assuming /dashboard is allowed for everyone, and sub-routes are restricted.
      // The loop above will catch /dashboard as the fallback if it's in the list.
      return true;
    };

    if (!matchingPermissionFn()) {
      isAllowed = false;
      router.push(DEFAULT_REDIRECT);
    } else {
      setAuthorized(true);
    }

  }, [pathname, role, router]);

  if (!authorized) {
    // return null or a loading spinner while redirecting
    return null;
  }

  return <>{children}</>;
}
