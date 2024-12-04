"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession(); // Vérifie si l'utilisateur est connecté

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <span className='shape'></span>
      <div className="absolute left-5 top-5 text-xs font-light">
        Créer par <span className="font-bold">Florian Tran</span>
      </div>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="text-[var(--font)]">
          <p className="text-5xl text-[var(--secondary-font)]">Welcome to </p>
          <h1 className="text-9xl font-bold text-[var(--font)]">Secret Manager</h1>
        </div>
        <p className="text-xl font-light text-[var(--secondary-font)]">
          Une application simple pour gérer vos secrets de manière totalement sécurisée.
        </p>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            href="/create"
            className="rounded-full border border-solid border-transparent transition-colors duration-500 flex items-center justify-center bg-foreground gap-2 hover:bg-[var(--accent)] text-[var(--background)] hover:text-white text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Créer un secret
          </Link>

          {!session ? (
            <Link
              href="/login"
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors duration-500 flex items-center justify-center hover:text-black hover:bg-[#f2f2f2] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            >
              Connexion
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors duration-500 flex items-center justify-center hover:text-black hover:bg-[#f2f2f2] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            >
              Dashboard
            </Link>
          )}
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-sm font-extralight">
        <p className="flex items-center gap-2 hover:underline hover:underline-offset-4">
          Backend: NestJs
        </p>
        <p className="flex items-center gap-2 hover:underline hover:underline-offset-4">
          Frontend: NextJs
        </p>
        <p className="flex items-center gap-2 hover:underline hover:underline-offset-4">
          Base de données: PostgreSQL & TypeORM
        </p>
      </footer>
    </div>
  );
}
