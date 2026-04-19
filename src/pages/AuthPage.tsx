// FormEvent is the TypeScript type for form submit events
import { useState, FormEvent } from "react";
import { useAuth } from "../hooks/useAuthContext";

export default function AuthPage() {
  const { login, register } = useAuth();

  // "as const" narrows the type to the literal values "login" | "register"
  // without it TypeScript would infer the type as string
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    // Prevent the browser's default form behaviour (page reload)
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      // On success, useAuth updates isAuthenticated and App.tsx renders the protected routes
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="bg-card border border-border rounded-xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold text-accent tracking-tight">bookd.</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 mb-8">
          Resource booking, simplified.
        </p>

        {/* Tab switcher between login and register */}
        <div className="flex gap-2 mb-6">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-sm capitalize transition-colors ${
                mode === m
                  ? "bg-accent text-white"
                  : "border border-border text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Only show the name field in register mode */}
          {mode === "register" && (
            <input
              className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-200 outline-none focus:border-accent"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-200 outline-none focus:border-accent"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-200 outline-none focus:border-accent"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            className="bg-accent text-white rounded-lg py-2.5 text-sm font-semibold mt-1 hover:bg-opacity-90 disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? "..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
