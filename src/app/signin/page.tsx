import Link from "next/link";
import { Suspense } from "react";
import { SigninForm } from "./SigninForm";

export const metadata = { title: "Sign in | EcoMart" };

export default function SigninPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-[350px] flex-col items-center px-4 pt-6">
        <Link href="/" className="mb-4 text-[28px] font-bold tracking-tight">
          EcoMart<span className="text-[#FF9900]">.in</span>
        </Link>

        <div className="w-full rounded-[8px] border border-[#DDD] p-5">
          <h1 className="text-[28px] font-normal text-[#0F1111]">Sign in</h1>
          <Suspense>
            <SigninForm />
          </Suspense>
        </div>

        <div className="mt-6 w-full border-t border-[#e7e7e7] pt-6">
          <p className="text-center text-[13px] font-bold text-[#0F1111]">New to EcoMart?</p>
          <Link
            href="/register"
            className="mt-2 flex h-[29px] w-full items-center justify-center rounded-[8px] border border-[#ADB1B8] bg-white text-[13px] text-[#0F1111] shadow-sm hover:bg-[#F7FAFA]"
          >
            Create your EcoMart account
          </Link>
        </div>

        <div className="mt-6 rounded border border-[#EAEDED] bg-[#FCFCFC] p-3 text-[11px] leading-relaxed text-[#0F1111]">
          <p className="font-bold">Demo credentials</p>
          <p className="text-[#565959]">Use any account you create — or click &ldquo;Demo sign-in&rdquo; on the next screen after registering.</p>
        </div>
      </div>

      <footer className="mt-10 border-t border-[#DDD] bg-[#FCFCFC] py-6 text-center text-[11px] text-[#555]">
        <div className="space-x-4">
          <a href="#" className="text-[#0066C0] hover:text-[#C45500] hover:underline">
            Conditions of Use
          </a>
          <a href="#" className="text-[#0066C0] hover:text-[#C45500] hover:underline">
            Privacy Notice
          </a>
          <a href="#" className="text-[#0066C0] hover:text-[#C45500] hover:underline">
            Help
          </a>
        </div>
        <p className="mt-3 text-[#555]">© 1996-2026, EcoMart.in — educational simulator</p>
      </footer>
    </div>
  );
}
