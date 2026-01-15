"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    function updateNavbarState() {
      const token = localStorage.getItem("token");
      let userRole = localStorage.getItem("role");
      // Always uppercase for comparison
      userRole = userRole ? userRole.toUpperCase() : null;
      const hasToken = Boolean(token && token !== "null" && token !== "undefined");
      setIsLoggedIn(hasToken);
      if (hasToken && !userRole) {
        setRole("USER");
      } else {
        setRole(userRole);
      }
    }
    setIsClient(true);
    updateNavbarState();
    window.addEventListener("storage", updateNavbarState);
    return () => window.removeEventListener("storage", updateNavbarState);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setRole(null);
    router.push("/");
  }

  return (
    <header className="w-full bg-white shadow-md">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-lg font-bold text-green-700">
          ⚽ Tippelde
        </Link>

        <div className="flex gap-4 text-sm font-medium">
          {!isClient ? (
            // Loading state - show nothing or minimal UI
            null
          ) : isLoggedIn && role === "ADMIN" ? (
            // ADMIN MENU
            <>
              <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition font-semibold">
                ⚙️ Admin Panel
              </Link>
              <Link href="/verseny" className="text-gray-700 hover:text-purple-600 transition font-semibold">
                🏆 Verseny állása
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 transition cursor-pointer"
              >
                Kijelentkezés
              </button>
            </>
          ) : isLoggedIn ? (
            // USER MENU
            <>
              <Link href="/tippeles" className="text-gray-700 hover:text-blue-600 transition">
                Tippelés
              </Link>
              <Link href="/profil" className="text-gray-700 hover:text-purple-600 transition">
                Profilom
              </Link>
              <Link href="/verseny" className="text-gray-700 hover:text-purple-600 transition">
                Verseny
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 transition cursor-pointer"
              >
                Kijelentkezés
              </button>
            </>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
