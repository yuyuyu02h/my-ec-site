export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="/" className="text-xl font-bold tracking-widest">
            BRAND NAME
          </a>

          <nav className="flex items-center gap-6 text-sm">
            <a href="#product" className="hover:opacity-60">
              PRODUCT
            </a>
            <a href="#about" className="hover:opacity-60">
              ABOUT
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100">
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              PRODUCT IMAGE
            </div>
          </div>

          {/* Product Information */}
          <div id="product">
            <p className="mb-4 text-xs tracking-[0.3em] text-gray-500">
              NEW COLLECTION
            </p>

            <h1 className="text-3xl font-medium tracking-wide md:text-4xl">
              PRODUCT NAME
            </h1>

            <p className="mt-6 text-xl">
              ¥5,000
            </p>

            <div className="mt-8 border-t border-gray-200 pt-8">
              <p className="text-sm leading-7 text-gray-600">
                ここに商品の説明を入れます。
                <br />
                商品の特徴、素材、サイズ感などを記載します。
              </p>
            </div>

            {/* Size */}
            <div className="mt-8">
              <p className="mb-3 text-sm font-medium">
                SIZE
              </p>

              <div className="flex gap-2">
                {["S", "M", "L", "XL"].map((size) => (
                  <button
                    key={size}
                    className="h-11 w-14 border border-gray-300 text-sm transition hover:border-black"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Purchase Button */}
            <button className="mt-8 w-full bg-black py-4 text-sm font-medium tracking-widest text-white transition hover:bg-gray-800">
              BUY NOW
            </button>

            <p className="mt-4 text-center text-xs text-gray-400">
              受注生産 / ご注文後に製作します
            </p>
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="border-t border-gray-200 bg-gray-50 px-6 py-20"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs tracking-[0.3em] text-gray-500">
            ABOUT
          </p>

          <h2 className="mt-4 text-2xl font-medium">
            BRAND CONCEPT
          </h2>

          <p className="mt-8 text-sm leading-8 text-gray-600">
            ここにブランドコンセプトを記載します。
            <br />
            ブランドの考え方や商品の背景などを説明できます。
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-xs text-gray-500 md:flex-row md:items-center md:justify-between">
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