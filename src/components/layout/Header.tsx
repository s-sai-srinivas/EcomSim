"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cart.store";
import { AccountBlock } from "./AccountBlock";
import { Logo } from "./Logo";
import { CartIcon, ChevronDownIcon, MagnifierIcon, PinIcon } from "./icons";

function NavBlock({
  top,
  bottom,
  href = "#",
  chevron = false,
}: {
  top: string;
  bottom: string;
  href?: string;
  chevron?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col justify-center rounded-sm border border-transparent px-2 py-1.5 leading-tight hover:border-white"
    >
      <span className="text-[12px] text-[#CCCCCC]">{top}</span>
      <span className="flex items-center gap-1 text-[14px] font-bold text-white">
        {bottom}
        {chevron && <ChevronDownIcon className="h-2.5 w-2.5 text-[#CCCCCC]" />}
      </span>
    </Link>
  );
}

export function Header() {
  const cartCount = useCartStore((s) => s.lines.reduce((acc, l) => acc + l.qty, 0));

  return (
    <header className="w-full">
      {/* Top bar */}
      <div className="flex items-center gap-1 bg-nav-primary px-3 py-1.5 text-white">
        <Link
          href="/"
          className="rounded-sm border border-transparent px-2 py-2.5 hover:border-white"
        >
          <Logo />
        </Link>

        <button
          type="button"
          className="hidden items-center gap-0.5 rounded-sm border border-transparent px-2 py-1.5 text-left leading-tight hover:border-white md:flex"
        >
          <span className="mt-2">
            <PinIcon />
          </span>
          <span className="flex flex-col">
            <span className="text-[12px] text-[#CCCCCC]">Delivering to Bengaluru 560001</span>
            <span className="text-[14px] font-bold">Update location</span>
          </span>
        </button>

        {/* Search */}
        <form action="/s" className="mx-2 flex h-10 flex-1 overflow-hidden rounded-[4px] focus-within:ring-[3px] focus-within:ring-[#F90]">
          <select
            name="category"
            aria-label="Search category"
            className="h-full cursor-pointer border-r border-[#cdcdcd] bg-[#E6E6E6] px-2 text-[12px] text-[#0F1111] outline-none hover:bg-[#dadada]"
            defaultValue=""
          >
            <option value="">All</option>
            <option value="electronics">Electronics</option>
            <option value="home-and-kitchen">Home &amp; Kitchen</option>
            <option value="fashion">Fashion</option>
            <option value="beauty">Beauty</option>
          </select>
          <input
            type="search"
            name="k"
            placeholder="Search EcoMart.in"
            className="h-full w-full bg-white px-3 text-[15px] text-[#0F1111] outline-none placeholder:text-[#767676]"
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex h-full w-[45px] items-center justify-center bg-search-orange text-[#131921] hover:bg-[#F3A847]"
          >
            <MagnifierIcon />
          </button>
        </form>

        <NavBlock top="🇮🇳 EN" bottom="" href="#" chevron />

        <AccountBlock />
        <NavBlock top="Returns" bottom="& Orders" href="/orders" />

        <Link
          href="/cart"
          className="relative flex items-end rounded-sm border border-transparent px-2 py-1.5 hover:border-white"
        >
          <span className="absolute left-[22px] top-[0px] w-5 text-center text-[16px] font-bold text-[#F08804]">
            {cartCount}
          </span>
          <span className="flex items-center gap-1">
            <CartIcon />
            <span className="hidden pb-[2px] text-[14px] font-bold md:inline">Cart</span>
          </span>
        </Link>
      </div>

      {/* Department nav */}
      <nav className="flex items-center gap-0 bg-nav-secondary px-2 py-1 text-[14px] text-white">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-sm border border-transparent px-2 py-1.5 font-bold hover:border-white"
        >
          <span className="text-[16px] leading-none">☰</span> All
        </button>
        {["Fresh", "Sell", "Bestsellers", "Today's Deals", "Mobiles", "Electronics", "Home & Kitchen", "Fashion", "Customer Service"].map(
          (label) => (
            <Link
              key={label}
              href={label === "Bestsellers" ? "/s?sort=rating" : "/s"}
              className="whitespace-nowrap rounded-sm border border-transparent px-2 py-1.5 hover:border-white"
            >
              {label}
            </Link>
          ),
        )}
        <Link
          href="/s"
          className="whitespace-nowrap rounded-sm border border-transparent px-2 py-1.5 font-medium hover:border-white"
        >
          Prime
          <ChevronDownIcon className="ml-1 inline h-2.5 w-2.5 text-[#CCCCCC]" />
        </Link>
      </nav>
    </header>
  );
}
