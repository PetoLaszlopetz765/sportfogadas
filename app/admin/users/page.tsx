"use client";



import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: number;
  username: string;
  role: string;
  points: number;
}

export default function UsersAdminPage() {
    // Kezdő kredit állapotok
    const [initialCredits, setInitialCredits] = useState<number | null>(null);
    const [initialCreditsInput, setInitialCreditsInput] = useState<string>("");
    const [initialCreditsMsg, setInitialCreditsMsg] = useState<string>("");
    const [initialCreditsLoading, setInitialCreditsLoading] = useState(false);

    // Kezdő kredit lekérése
    async function loadInitialCredits() {
      try {
        const res = await fetch("/api/settings/initial-credits");
        if (res.ok) {
          const data = await res.json();
          setInitialCredits(data.initialCredits);
          setInitialCreditsInput(String(data.initialCredits));
        }
      } catch {}
    }

    useEffect(() => {
      if (typeof window !== 'undefined') {
        loadInitialCredits();
      }
    }, []);

    async function handleInitialCreditsSubmit(e: React.FormEvent) {
      e.preventDefault();
      setInitialCreditsLoading(true);
      setInitialCreditsMsg("");
      try {
        const res = await fetch("/api/settings/initial-credits", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ value: Number(initialCreditsInput) }),
        });
        const data = await res.json();
        if (res.ok) {
          setInitialCreditsMsg("✓ " + data.message);
          setInitialCredits(Number(initialCreditsInput));
        } else {
          setInitialCreditsMsg(data?.message || "Hiba a kezdő kredit mentésekor.");
        }
      } catch {
        setInitialCreditsMsg("Hálózati hiba");
      } finally {
        setInitialCreditsLoading(false);
      }
    }
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("USER");
  const [message, setMessage] = useState<string>("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  // Kredit szerkesztő állapotok minden userId-hez
  const [creditInputs, setCreditInputs] = useState<{ [userId: number]: string }>({});
  const [creditLoading, setCreditLoading] = useState<{ [userId: number]: boolean }>({});
  const [creditMsg, setCreditMsg] = useState<{ [userId: number]: string }>({});

  useEffect(() => {
    console.log("🔧 USERS ADMIN PAGE MOUNTED");
    setIsClient(true);
    const savedToken = localStorage.getItem("token");
    console.log("📦 Token from localStorage:", savedToken ? "✓ Found (length: " + savedToken.length + ")" : "✗ Not found");
    setToken(savedToken);
  }, []);

  async function loadUsers() {
    if (!token) {
      console.log("⚠️  Token nincs meg, nem lehet felhasználókat betölteni");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else if (res.status === 401) {
        console.log("✗ Unauthorized - redirecting to login");
        window.location.href = "/login";
      } else {
        console.error("✗ Error loading users:", res.status);
      }
    } catch (err) {
      console.error("✗ Network error:", err);
    }
  }

  useEffect(() => {
    console.log("🔧 useEffect: isClient =", isClient);
    if (isClient) {
      if (token) {
        console.log("✅ Client-side and token available, loading users...");
        loadUsers();
      } else {
        console.log("⚠️  Token nincs meg, bejelentkezés szükséges");
        setMessage("⚠️  Nincs bejelentkezve! Az admin funkciók eléréséhez be kell jelentkezned.");
      }
    } else {
      console.log("✗ Not yet client-side");
    }
  }, [isClient, token]);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setUsersLoading(true);

    if (!token) {
      setMessage("✗ Nincs bejelentkezve! Csak adminok tudnak felhasználót létrehozni.");
      window.location.href = "/login";
      setUsersLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          role: newRole,
        }),
      });

      if (res.ok) {
        setMessage("✅ Felhasználó létrehozva!");
        setNewUsername("");
        setNewPassword("");
        setNewRole("USER");
        await loadUsers();
      } else if (res.status === 401) {
        setMessage("✗ A session lejárt! Kérjük jelentkezz be újra.");
        window.location.href = "/login";
      } else {
        const data = await res.json().catch(() => null);
        setMessage(data?.message || "✗ Hiba a felhasználó létrehozásakor.");
      }
    } catch (err) {
      console.error(err);
      setMessage("✗ Hálózati hiba történt.");
    } finally {
      setUsersLoading(false);
    }
  }

  async function deleteUser(userId: number) {
    if (!confirm("Biztosan törlöd ezt a felhasználót?")) return;

    if (!token) {
      setMessage("✗ Nincs bejelentkezve!");
      window.location.href = "/login";
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (res.ok) {
        setMessage("✅ Felhasználó törölve!");
        await loadUsers();
      } else if (res.status === 401) {
        setMessage("✗ A session lejárt! Kérjük jelentkezz be újra.");
        window.location.href = "/login";
      } else {
        setMessage("✗ Hiba a törléskor.");
      }
    } catch (err) {
      console.error(err);
      setMessage("✗ Hálózati hiba történt.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h1 className="text-3xl font-extrabold text-gray-900">
              👥 Felhasználó kezelés
            </h1>
            <Link
              href="/admin"
              className="px-4 py-2 rounded-lg bg-gray-800 text-white font-semibold hover:bg-gray-900 transition"
            >
              ← Vissza az admin felületre
            </Link>
          </div>
          <p className="text-gray-700">
            Felhasználók létrehozása, szerkesztése és törlése
          </p>
        </header>

        {!token && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <p className="text-red-800 font-semibold">⚠️  Nincsenek bejelentkezve! Az admin funkciók eléréséhez be kell jelentkezned.</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Kezdő kredit szerkesztése */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-extrabold text-gray-900 mb-4">Kezdő kredit beállítása</h2>
            <form onSubmit={handleInitialCreditsSubmit} className="flex flex-col md:flex-row items-center gap-4">
              <input
                type="number"
                value={initialCreditsInput}
                onChange={e => setInitialCreditsInput(e.target.value)}
                className="w-32 h-10 px-3 rounded border border-gray-300 text-gray-900 font-semibold text-lg"
                min={0}
                disabled={initialCreditsLoading}
              />
              <button
                type="submit"
                disabled={initialCreditsLoading || !initialCreditsInput}
                className="px-4 py-2 bg-green-600 text-white rounded font-bold text-base hover:bg-green-700 transition"
              >
                {initialCreditsLoading ? "Mentés..." : "Mentés"}
              </button>
              {initialCreditsMsg && <span className="text-green-700 font-semibold ml-2">{initialCreditsMsg}</span>}
            </form>
            {initialCredits !== null && (
              <p className="text-gray-700 mt-2">Jelenlegi kezdő kredit: <span className="font-bold">{initialCredits}</span></p>
            )}
          </div>
          {/* Új felhasználó form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-extrabold text-gray-900 mb-4">
              Új felhasználó létrehozása
            </h2>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Felhasználónév
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="pl. szilard123"
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-300 text-gray-900 font-semibold
                      placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Jelszó
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-300 text-gray-900 font-semibold
                      placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Szerepkör
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-300 text-gray-900 font-semibold
                      focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              {message && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                  <p className="text-gray-900 font-semibold">{message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={usersLoading}
                className={`w-full h-12 rounded-2xl text-white font-extrabold shadow transition
                  ${usersLoading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-700 hover:bg-purple-800 active:bg-purple-900"}`}
              >
                {usersLoading ? "Létrehozás..." : "Felhasználó létrehozása"}
              </button>
            </form>
          </div>

          {/* Felhasználók listája */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-extrabold text-gray-900">
                Felhasználók listája
              </h2>
              <p className="text-sm text-gray-700 mt-1">
                Összesen: <span className="font-bold text-gray-900">{users.length}</span> felhasználó
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Felhasználónév</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Szerepkör</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Pontok</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Kredit</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Műveletek</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center">
                        <p className="text-gray-600 font-semibold">Nincsenek felhasználók.</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-900">{user.username}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                            user.role === "ADMIN" 
                              ? "bg-red-50 text-red-800" 
                              : "bg-blue-50 text-blue-800"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-gray-900">{user.points}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              setCreditLoading((prev) => ({ ...prev, [user.id]: true }));
                              setCreditMsg((prev) => ({ ...prev, [user.id]: "" }));
                              try {
                                const res = await fetch(`/api/users/${user.id}/credit`, {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ amount: Number(creditInputs[user.id]) }),
                                });
                                const data = await res.json();
                                if (res.ok) {
                                  setCreditMsg((prev) => ({ ...prev, [user.id]: "✓ " + data.message }));
                                  await loadUsers();
                                } else {
                                  setCreditMsg((prev) => ({ ...prev, [user.id]: data?.message || "Hiba a kredit módosításakor." }));
                                }
                              } catch {
                                setCreditMsg((prev) => ({ ...prev, [user.id]: "Hálózati hiba" }));
                              } finally {
                                setCreditLoading((prev) => ({ ...prev, [user.id]: false }));
                                setCreditInputs((prev) => ({ ...prev, [user.id]: "" }));
                              }
                            }}
                            className="flex items-center gap-2 justify-center"
                          >
                            <input
                              type="number"
                              value={creditInputs[user.id] || ""}
                              onChange={e => setCreditInputs((prev) => ({ ...prev, [user.id]: e.target.value }))}
                              placeholder="±kredit"
                              className="w-20 h-8 px-2 rounded border border-gray-300 text-gray-900 font-semibold text-sm"
                              disabled={creditLoading[user.id]}
                            />
                            <button
                              type="submit"
                              disabled={creditLoading[user.id] || !creditInputs[user.id]}
                              className="px-2 py-1 bg-yellow-400 text-white rounded font-bold text-xs hover:bg-yellow-500 transition"
                            >
                              {creditLoading[user.id] ? "Mentés..." : "Kredit módosít"}
                            </button>
                          </form>
                          {creditMsg[user.id] && <div className="text-xs text-center mt-1 text-yellow-700">{creditMsg[user.id]}</div>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="px-3 py-1 bg-red-50 text-red-800 rounded-lg hover:bg-red-100 transition font-semibold text-sm"
                          >
                            🗑️  Törlés
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-700">
          made by <span className="font-bold text-gray-900">@petz765</span>
        </div>
      </div>
    </div>
  );
}
