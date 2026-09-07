import LoginForm from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-24 text-black">
      <div className="mx-auto max-w-md">
        <p className="text-xs tracking-[0.25em] text-gray-500">
          ADMIN
        </p>

        <h1 className="mt-3 text-3xl font-bold">LOGIN</h1>

        <LoginForm />
      </div>
    </main>
  );
}
