import Link from "next/link";
import ClearCart from "./ClearCart";

type Props = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;

  return (
    <main className="min-h-screen bg-white px-6 py-24 text-black">
      <ClearCart shouldClear={Boolean(sessionId)} />
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs tracking-[0.25em] text-gray-500">
          ORDER COMPLETE
        </p>

        <h1 className="mt-4 text-4xl font-bold">
          THANK YOU
        </h1>

        <p className="mt-6 text-sm leading-7 text-gray-600">
          ご注文ありがとうございます。
          <br />
          お支払いが正常に完了しました。
        </p>

        <Link
          href="/"
          className="mt-10 inline-block border border-black px-8 py-4 text-sm font-medium transition hover:bg-black hover:text-white"
        >
          BACK TO HOME
        </Link>
      </div>
    </main>
  );
}
