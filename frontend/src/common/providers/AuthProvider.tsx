"use client";

import { useAuth } from "@/apis/auth/hooks";
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

  // Hydrate từ localStorage khi component mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Nếu user tồn tại trong store nhưng chưa fetch profile, fetch ngay
  useEffect(() => {
    if (isHydrated && user && !profileQuery.data) {
      profileQuery.refetch();
    }
  }, [isHydrated, user, profileQuery]);

  // Tránh hydration mismatch
  if (!isHydrated) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
