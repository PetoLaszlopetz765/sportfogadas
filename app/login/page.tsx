"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        // Token és user adatok mentése localStorage-ba
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("role", data.role);
        setMessage("✅ Sikeres belépés!");
        // Teljes oldalfrissítés, hogy a Navbar is azonnal frissüljön
        setTimeout(() => {
          window.location.href = data.role === "ADMIN" ? "/admin" : "/tippeles";
        }, 300);
      } else {
        const data = await res.json().catch(() => null);
        setMessage(data?.message || "❌ Hibás felhasználónév vagy jelszó.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Hálózati hiba történt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-md mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 text-center">
            Belépés
          </h1>
          <p className="mt-2 text-center text-gray-700">
            Tippelde – Foci VB 2026
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Felhasználónév
              </label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="pl. petz765"
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-300 text-gray-900 font-semibold
                  placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Jelszó
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-300 text-gray-900 font-semibold
                  placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                required
              />
            </div>

            {message && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-gray-900 font-semibold">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-12 rounded-2xl text-white font-extrabold shadow transition
                ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800 active:bg-blue-900"}`}
            >
              {loading ? "Belépés..." : "Belépés"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-700">
              Nincs még fiókod?{" "}
              <Link
                className="font-bold text-blue-700 hover:text-blue-800"
                href="/register"
              >
                Regisztráció
              </Link>
            </p>

            <p className="mt-2 text-sm text-gray-700">
              A részvétel meghívóval lehetséges.
            </p>

            <p className="mt-2 text-sm text-gray-700">
              <Link className="font-bold text-blue-700 hover:text-blue-800" href="/szabalyzat">
                Szabályzat megtekintése
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-700">
          made by <span className="font-bold text-gray-900">@petz765</span>
        </div>
      </div>
    </div>
  );
}
