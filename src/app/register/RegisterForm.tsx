"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setErr(json.error ?? "Registration failed.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-3">
      <label className="block">
        <span className="text-[13px] font-bold text-[#0F1111]">Your name</span>
        <input
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First and last name"
          className="mt-1 w-full rounded-[3px] border border-[#888C8C] px-2 py-[6px] text-[13px] shadow-[0_1px_2px_rgba(15,17,17,0.15)] outline-none focus:border-[#E77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)]"
        />
      </label>
      <label className="block">
        <span className="text-[13px] font-bold text-[#0F1111]">Email</span>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-[3px] border border-[#888C8C] px-2 py-[6px] text-[13px] shadow-[0_1px_2px_rgba(15,17,17,0.15)] outline-none focus:border-[#E77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)]"
          required
        />
      </label>
      <label className="block">
        <span className="text-[13px] font-bold text-[#0F1111]">Password</span>
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          className="mt-1 w-full rounded-[3px] border border-[#888C8C] px-2 py-[6px] text-[13px] shadow-[0_1px_2px_rgba(15,17,17,0.15)] outline-none focus:border-[#E77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)]"
          required
        />
        <span className="mt-1 block text-[12px] text-[#565959]">Passwords must be at least 6 characters.</span>
      </label>
      {err && (
        <div className="rounded border border-[#C40000] bg-[#FFF4F4] p-3 text-[13px] text-[#C40000]">{err}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="h-[31px] w-full rounded-[8px] bg-cta-yellow text-[13px] font-medium text-[#0F1111] hover:bg-[#F7CA00] disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create your EcoMart account"}
      </button>
      <p className="text-[12px] leading-snug text-[#0F1111]">
        By creating an account, you agree to EcoMart&apos;s{" "}
        <a href="#" className="text-[#0066C0] hover:text-[#C45500] hover:underline">
          Conditions of Use
        </a>{" "}
        and{" "}
        <a href="#" className="text-[#0066C0] hover:text-[#C45500] hover:underline">
          Privacy Notice
        </a>
        .
      </p>
    </form>
  );
}
