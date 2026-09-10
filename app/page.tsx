import Link from "next/link";
import StoreHeader from "@/app/components/StoreHeader";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_available", true)
    .order("id");

  if (error) {
    console.error("Supabase error:", error);
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <StoreHeader />

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <p className="mb-4 text-sm tracking-[0.3em]">
          NEW COLLECTION
        </p>

        <h2 className="text-5xl font-bold tracking-tight md:text-7xl">
          BRAND NAME
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-gray-600">
          Original clothing created with a focus on simplicity,
          individuality and everyday wear.
        </p>
      </section>

      {/* Products */}
      <section id="products" className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs tracking-[0.25em] text-gray-500">
                COLLECTION
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                PRODUCTS
              </h2>
            </div>

            <p className="text-sm text-gray-500">
              {products?.length ?? 0} PRODUCTS
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {products?.map((product) => (
              <article key={product.id}>
                {/* Product Image */}
                <div className="flex aspect-[4/5] items-center justify-center bg-gray-100">
                  <span className="text-sm text-gray-400">
                    PRODUCT IMAGE
                  </span>
                </div>

                {/* Product Information */}
                <div className="pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {product.name}
                      </h3>

                      <p className="mt-2 text-sm text-gray-600">
                        {product.description}
                      </p>
                    </div>

                    <p className="whitespace-nowrap text-sm">
                      ¥{product.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4">
                    <p className="text-sm">
                      SIZE:{" "}
                      <span className="font-semibold">
                        {product.size}
                      </span>
                    </p>

                    <Link
                      href={`/products/${product.id}`}
                      className="border border-black px-6 py-3 text-sm font-medium transition hover:bg-black hover:text-white"
                    >
                      VIEW PRODUCT
                    </Link>
                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    MADE TO ORDER
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="border-t border-black px-6 py-24"
      >
        <div className="mx-auto max-w-3xl">
          <p className="text-xs tracking-[0.25em] text-gray-500">
            ABOUT
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            BRAND CONCEPT
          </h2>

          <p className="mt-8 text-sm leading-8 text-gray-700">
            This is the brand concept.
            <br />
            Replace this text with your actual brand story,
            philosophy and concept.
          </p>
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
