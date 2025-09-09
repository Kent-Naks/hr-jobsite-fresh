import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="p-6 min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <LoginForm />
        <p className="text-xs text-gray-500 mt-4">
          Tip: set <code>ADMIN_PASSWORD</code> and <code>ADMIN_SESSION_TOKEN</code> in <code>.env.local</code>.
        </p>
      </div>
    </main>
  );
}
