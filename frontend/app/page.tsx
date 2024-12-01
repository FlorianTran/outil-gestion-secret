import { SecretsService } from '@/lib/services/secrets-service';
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="absolute left-5 top-5 text-xs font-light">
        Créer par <span className="font-bold">Florian Tran</span>
      </div>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="text-neutral-300">
          <p className="text-5xl font-medium">Welcome to </p>
          <h1 className="text-9xl font-bold text-white">Secret Manager</h1>
        </div>
        <p className="text-xl font-light">
          Une application simple pour gérer vos secrets de manière totalement sécurisée.
        </p>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            href="/create"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
          >
            Sign In
          </Link>
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
