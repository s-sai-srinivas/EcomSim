"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDownIcon } from "./icons";

interface MeResponse {
  user: { id: string; email?: string; name?: string } | null;
}

export function AccountBlock() {
  const [me, setMe] = useState<MeResponse["user"] | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j: MeResponse) => setMe(j.user))
      .catch(() => setMe(null));
  }, []);

  if (me === undefined) {
    return (
      <Link
        href="/signin"
        className="flex flex-col justify-center rounded-sm border border-transparent px-2 py-1.5 leading-tight hover:border-white"
      >
        <span className="text-[12px] text-[#CCCCCC]">Hello, sign in</span>
        <span className="flex items-center gap-1 text-[14px] font-bold text-white">
          Account & Lists <ChevronDownIcon className="h-2.5 w-2.5 text-[#CCCCCC]" />
        </span>
      </Link>
    );
  }

  if (me === null) {
    return (
      <Link
        href="/signin"
        className="flex flex-col justify-center rounded-sm border border-transparent px-2 py-1.5 leading-tight hover:border-white"
      >
        <span className="text-[12px] text-[#CCCCCC]">Hello, sign in</span>
        <span className="flex items-center gap-1 text-[14px] font-bold text-white">
          Account & Lists <ChevronDownIcon className="h-2.5 w-2.5 text-[#CCCCCC]" />
        </span>
      </Link>
    );
  }

  const display = me.name ?? me.email ?? "Account";

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    setMe(null);
    router.refresh();
  }

  return (
    <div className="group relative">
      <Link
        href="/wishlist"
        className="flex flex-col justify-center rounded-sm border border-transparent px-2 py-1.5 leading-tight hover:border-white"
      >
        <span className="text-[12px] text-[#CCCCCC]">Hello, {display}</span>
        <span className="flex items-center gap-1 text-[14px] font-bold text-white">
          Account & Lists <ChevronDownIcon className="h-2.5 w-2.5 text-[#CCCCCC]" />
        </span>
      </Link>
      <div className="absolute right-0 top-full z-20 hidden w-48 rounded-[8px] border border-[#D5D9D9] bg-white p-3 shadow-lg group-hover:block">
        <p className="text-[13px] font-bold text-[#0F1111]">{display}</p>
        {me.email && <p className="text-[12px] text-[#565959]">{me.email}</p>}
        <div className="mt-2 flex flex-col gap-1 text-[13px]">
          <Link href="/wishlist" className="text-[#007185] hover:text-[#C7511F] hover:underline">
            Your Lists
          </Link>
          <Link href="/orders" className="text-[#007185] hover:text-[#C7511F] hover:underline">
            Your Orders
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="text-left text-[#007185] hover:text-[#C7511F] hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
