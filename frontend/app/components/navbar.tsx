'use client';

import Link from "next/link";
import "../globals.css";
import { useSession } from "next-auth/react";
import { FaGoogle } from 'react-icons/fa'; // Importer l'icône Google

export default function Navbar() {
  const { data: session } = useSession(); // Récupérer l'état de session utilisateur

  return (
    <nav className="flex justify-between items-center px-6 py-4 text-[var(--font)] fixed top-0 w-full z-50 h-16">
      <div>
        <Link href="/" className="text-[var(--font)] no-underline hover:text-[var(--accent)]  transition-colors duration-500">
          <h1 className="text-xl font-bold">Secret Manager</h1>
        </Link>
      </div>
      <ul className="flex gap-6 list-none items-center">
        <li>
          <Link href="/create" className="text-[var(--font)] no-underline hover:text-[var(--accent)] transition-colors duration-500">
            Nouveau Secret
          </Link>
        </li>
        <li>
          <Link href="/retrieve" className="text-[var(--font)] no-underline hover:text-[var(--accent)] transition-colors duration-500">
            Récupération
          </Link>
        </li>
        {session ? (
          <>
            <li>
              <Link href="/dashboard" className="text-[var(--font)] no-underline hover:text-[var(--accent)] transition-colors duration-500">
                Dashboard
              </Link>
            </li>
            <li className="flex items-center gap-2">
              {session.user?.image ? (
                <img
                  src={session.user?.image}
                  className="w-8 h-8 rounded-full object-cover"
                  alt=""
                />
              ) : (
                <FaGoogle className="w-8 h-8 text-[var(--font)]" /> // Icône Google
              )}
              <span className="text-sm">{session.user?.name}</span>
            </li>
          </>
        ) : (
          <li>
            <Link href="/login" className="text-[var(--font)] no-underline hover:text-[var(--accent)] transition-colors duration-500">
              Connexion
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
