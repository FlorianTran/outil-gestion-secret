'use client';

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      // Rediriger vers le tableau de bord si déjà connecté
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="w-full max-w-sm bg-card-background border border-[var(--border)] rounded-lg p-6">
        <h1 className="text-2xl font-bold text-foreground text-center mb-6">Connexion</h1>
        <button
          onClick={handleGoogleLogin}
          className={`w-full flex items-center justify-center bg-[var(--button-bg)] hover:bg-[var(--button-hover)] text-[var(--button-font)] py-2 px-4 rounded-full transition duration-200 mb-4 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loader"></span>
          ) : (
            "Se connecter avec Google"
          )}
        </button>
        <p className="text-center text-secondary-font">
          <Link href="/" className="text-[var(--primary)] hover:text-[var(--primary-hover)] underline">
            Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
