import Link from "next/link";
import { Logo } from "./Logo";

const COLUMNS: Array<{ title: string; links: string[] }> = [
  {
    title: "Get to Know Us",
    links: ["About EcoMart", "Careers", "Press Releases", "EcoMart Science"],
  },
  {
    title: "Connect with Us",
    links: ["Facebook", "Twitter", "Instagram"],
  },
  {
    title: "Make Money with Us",
    links: [
      "Sell on EcoMart",
      "Sell under Accelerator",
      "Protect and Build Your Brand",
      "Become an Affiliate",
    ],
  },
  {
    title: "Let Us Help You",
    links: [
      "Your Account",
      "Returns Centre",
      "100% Purchase Protection",
      "Help",
    ],
  },
];

const BOTTOM_LINKS: Array<{ title: string; sub: string }> = [
  { title: "EcoBasics", sub: "Everyday essentials" },
  { title: "EcoWeb Services", sub: "Scalable Cloud" },
  { title: "EcoAudible", sub: "Audio Books" },
  { title: "EcoFlix", sub: "Movies & TV" },
  { title: "EcoFresh", sub: "Grocery" },
  { title: "EcoBusiness", sub: "For Your Business" },
];

export function Footer() {
  return (
    <footer className="mt-auto w-full">
      <a
        href="#top"
        className="block bg-footer-top-strip py-4 text-center text-[13px] font-medium text-white hover:bg-[#485769]"
      >
        Back to top
      </a>

      <div className="bg-nav-secondary px-8 py-10">
        <div className="mx-auto grid max-w-[1000px] grid-cols-2 gap-8 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-[16px] font-bold text-white">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[13px] text-[#DDDDDD] hover:underline">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#3a4553] bg-nav-secondary py-8">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Logo />
          <span className="flex items-center gap-2 rounded-[3px] border border-[#848688] px-4 py-1.5 text-[13px] text-[#CCCCCC]">
            🌐 English
          </span>
          <span className="flex items-center gap-2 rounded-[3px] border border-[#848688] px-4 py-1.5 text-[13px] text-[#CCCCCC]">
            🇮🇳 India
          </span>
        </div>
      </div>

      <div className="bg-footer-bottom px-8 py-8">
        <div className="mx-auto grid max-w-[1000px] grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
          {BOTTOM_LINKS.map((l) => (
            <div key={l.title} className="text-center">
              <a href="#" className="text-[12px] font-medium text-[#DDDDDD] hover:underline">
                {l.title}
              </a>
              <p className="text-[11px] text-[#999999]">{l.sub}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 space-y-1 text-center">
          <p className="text-[11px] text-[#DDDDDD]">
            <Link href="#" className="mx-2 hover:underline">
              Conditions of Use &amp; Sale
            </Link>
            <Link href="#" className="mx-2 hover:underline">
              Privacy Notice
            </Link>
            <Link href="#" className="mx-2 hover:underline">
              Interest-Based Ads
            </Link>
          </p>
          <p className="text-[11px] text-[#999999]">
            © 2026, EcoMart.in — educational simulator, not affiliated with Amazon
          </p>
        </div>
      </div>
    </footer>
  );
}
