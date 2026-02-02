"use client";

import { useAuth } from "@/features/auth/hooks";
import { useAuthStore } from "@/common/stores";
import { useEffect, useState } from "react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { profileQuery } = useAuth();
  const { user } = useAuthStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && user && !profileQuery.data) {
      profileQuery.refetch();
    }
  }, [isHydrated, user, profileQuery]);

  if (!isHydrated) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
