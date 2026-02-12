"use client";

import { useAuth } from "@/features/auth/hooks";
import { useAuthStore } from "@/common/stores";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { profileQuery } = useAuth();
  const { user } = useAuthStore();

  const pathname = usePathname();
  const isPublic = ["/login", "/register", "/forgot-password"].includes(pathname);

  useEffect(() => {
    setIsHydrated(true);
  }, []);
  useEffect(() => {
  if (isHydrated && user && !profileQuery.data && !profileQuery.isError && !profileQuery.isFetching && !isPublic) {
    profileQuery.refetch();
  }
}, [isHydrated, user, profileQuery, isPublic]);

  if (!isHydrated) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
