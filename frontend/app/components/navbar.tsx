'use client';

import Link from "next/link";
import "../globals.css";
import { SecretsService } from '@/lib/services/secrets-service';
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [secretsCount, setSecretsCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession(); // Récupérer l'état de session utilisateur

  useEffect(() => {
    const fetchSecretCount = async () => {
      try {
        if (session) {
          const count = await SecretsService.getSecretCount();
          setSecretsCount(count);
        }
      } catch (err) {
        setError("Erreur lors de la récupération du nombre de secrets.");
        console.error(err);
      }
    };

    fetchSecretCount();
  }, [session]);

  return (
    <nav className="flex justify-between items-center px-6 py-4 text-white fixed top-0 w-full shadow-md z-50 h-16">
      <div>
        <Link href="/" className="text-white no-underline">
          <h1 className="text-xl font-bold">Secret Manager</h1>
        </Link>
      </div>
      <ul className="flex gap-6 list-none">
        <li>
          {error ? (
            <p className="text-sm font-light text-red-500">{error}</p>
          ) : (
            <p className="text-sm font-light">
              Nombre de Secret: {secretsCount ?? "Chargement..."}
            </p>
          )}
        </li>
        {session ? (
          <>
            <li>
              <Link href="/dashboard" className="text-white no-underline">
                Dashboard
              </Link>
            </li>
            <li>
              <button
                onClick={() => signOut()} // Déconnexion avec `next-auth`
                className="text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link href="/login" className="text-white no-underline">
              Login
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
