import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BuyButton from "./BuyButton";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_available", true)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-black px-6 py-5">
        <Link
          href="/"
          className="text-xl font-bold tracking-widest"
        >
          BRAND NAME
        </Link>

        <nav className="flex gap-8 text-sm">
          <Link href="/#products" className="hover:underline">
            PRODUCT
          </Link>

          <Link href="/#about" className="hover:underline">
            ABOUT
          </Link>
        </nav>
      </header>

      {/* Product */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-2">
          {/* Image */}
          <div className="flex aspect-[4/5] items-center justify-center bg-gray-100">
            <span className="text-sm text-gray-400">
              PRODUCT IMAGE
            </span>
          </div>

          {/* Information */}
          <div className="flex flex-col justify-center">
            <p className="text-xs tracking-[0.25em] text-gray-500">
              NEW COLLECTION
            </p>

            <h1 className="mt-4 text-4xl font-bold">
              {product.name}
            </h1>

            <p className="mt-5 text-lg">
              ¥{product.price.toLocaleString()}
            </p>

            <div className="mt-10 border-t border-gray-200 pt-8">
              <p className="text-sm leading-7 text-gray-700">
                {product.description}
              </p>
            </div>

            {/* Size */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  SIZE
                </span>

                <span className="text-sm font-semibold">
                  {product.size}
                </span>
              </div>
            </div>

            {/* Production */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  PRODUCTION
                </span>

                <span className="text-sm">
                  MADE TO ORDER
                </span>
              </div>
            </div>

            {/* Buy */}
<BuyButton
  productId={product.id}
  name={product.name}
  price={product.price}
/>

            <Link
              href="/#products"
              className="mt-5 text-center text-sm underline"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black px-6 py-8">
        <div className="flex flex-col gap-4 text-xs text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 BRAND NAME</p>

          <div className="flex gap-6">
            <a href="#" className="hover:text-black">
              特定商取引法に基づく表記
            </a>

            <a href="#" className="hover:text-black">
              プライバシーポリシー
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}