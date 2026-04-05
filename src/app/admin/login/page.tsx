"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-12 bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-center text-blue-950">Admin Access</h1>
        <p className="opacity-70 mb-6 text-center text-gray-600">Enter the admin password to manage certificates.</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold opacity-80 uppercase tracking-wide flex justify-between text-blue-950">
              Password
              {error && <span className="text-red-500 text-xs normal-case">{error}</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-900/20 text-black"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-yellow-500 text-white px-8 py-3 rounded-lg font-bold shadow hover:bg-yellow-600 transition-all disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
