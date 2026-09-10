import Link from "next/link";
import CartLink from "./CartLink";

export default function StoreHeader() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-black px-4 py-5 sm:px-6">
      <Link
        href="/"
        className="text-base font-bold tracking-widest sm:text-xl"
      >
        BRAND NAME
      </Link>

      <nav className="flex items-center gap-4 text-xs sm:gap-8 sm:text-sm">
        <Link href="/#products" className="hover:underline">
          PRODUCT
        </Link>

        <Link href="/#about" className="hidden hover:underline sm:inline">
          ABOUT
        </Link>

        <CartLink />
      </nav>
    </header>
  );
}
