
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);


  useEffect(() => {

    setIsClient(true);
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);
  }, []);

  // Meghívókód logika külön oldalon, nincs több loadInviteCodes

  if (!isClient) {
    return null;
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-3">
              ⚙️  Admin Panel
            </h1>
            <p className="text-center text-gray-700 text-lg">
              Admin panel
            </p>
          </header>

          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center mb-8">
            <p className="text-red-800 font-semibold text-lg mb-4">
              ⚠️  Nincsenek bejelentkezve!
            </p>
            <p className="text-red-700 mb-6">
              Az admin funkciók eléréséhez be kell jelentkezned.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition"
            >
              Bejelentkezés
            </Link>
          </div>

          <div className="text-center text-sm text-gray-700">
            made by <span className="font-bold text-gray-900">@petz765</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-3">
            ⚙️  Admin Panel
          </h1>
          <p className="text-center text-gray-700 text-lg">
            Válassz a kezelő felületek közül
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Meghívókódok külön oldalra */}
          <Link
            href="/admin/invite-codes"
            className="bg-white rounded-2xl shadow-sm border border-blue-300 p-8 mb-8 flex flex-col items-center hover:shadow-lg hover:border-purple-400 transition"
          >
            <h2 className="text-xl font-extrabold text-blue-800 mb-4">Meghívókódok kezelése</h2>
            <span className="text-blue-700">Új kód generálás, másolás, lista</span>
          </Link>
          {/* Hard reset gomb */}
          <div className="bg-white rounded-2xl shadow-sm border border-red-300 p-8 mb-8">
            <h2 className="text-xl font-extrabold text-red-800 mb-4">⚠️ Hard Reset</h2>
            <p className="text-red-700 mb-4">Ez a gomb minden felhasználót, eseményt és tippet töröl! Csak admin használhatja.</p>
            <button
              onClick={async () => {
                if (!window.confirm("Biztosan törölni akarod az összes adatot? Ez nem visszavonható!")) return;
                const res = await fetch("/api/admin/hard-reset", {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                  },
                });
                const data = await res.json();
                alert(data.message || "Hard reset lefutott.");
                window.location.reload();
              }}
              className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
            >
              Minden adat törlése
            </button>
          </div>
          {/* Esemény kezelés */}
          <Link
            href="/admin/events"
            className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-blue-300 transition"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">📅</div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                Esemény kezelés
              </h2>
            </div>
            <p className="text-gray-700 mb-6">
              Új eseményeket hozhatsz létre és az eredményeket felviheted.
            </p>
            <div className="text-blue-600 font-semibold group-hover:text-blue-700 flex items-center gap-2">
              Megnyitás
              <span>→</span>
            </div>
          </Link>

          {/* Felhasználó kezelés */}
          <Link
            href="/admin/users"
            className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-purple-300 transition"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">👥</div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                Felhasználó kezelés
              </h2>
            </div>
            <p className="text-gray-700 mb-6">
              Új felhasználókat hozhatsz létre és kezelheted azok szerepkörét.
            </p>
            <div className="text-purple-600 font-semibold group-hover:text-purple-700 flex items-center gap-2">
              Megnyitás
              <span>→</span>
            </div>
          </Link>
        </div>

        <div className="text-center text-sm text-gray-700">
          made by <span className="font-bold text-gray-900">@petz765</span>
        </div>
      </div>
    </div>
  );
}


