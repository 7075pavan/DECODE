"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";

export default function RootPage() {
  const router = useRouter();
  const { user, isOnboarded } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    } else if (!isOnboarded) {
      router.replace("/onboarding");
    } else {
      router.replace("/home");
    }
  }, [user, isOnboarded, router]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-[#0B0F1A]">
      <div className="w-8 h-8 rounded-full border-2 border-[#263047] border-t-[#22D3EE] animate-spin" />
    </div>
  );
}
