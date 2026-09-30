import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Create account | EcoMart" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-[350px] flex-col items-center px-4 pt-6">
        <Link href="/" className="mb-4 text-[28px] font-bold tracking-tight">
          EcoMart<span className="text-[#FF9900]">.in</span>
        </Link>
        <div className="w-full rounded-[8px] border border-[#DDD] p-5">
          <h1 className="text-[28px] font-normal text-[#0F1111]">Create account</h1>
          <RegisterForm />
          <hr className="my-4 border-[#EAEDED]" />
          <p className="text-[13px] text-[#0F1111]">
            Already have an account?{" "}
            <Link href="/signin" className="text-[#0066C0] hover:text-[#C45500] hover:underline">
              Sign in
            </Link>
          </p>
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
