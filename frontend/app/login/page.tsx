'use client';

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      // Rediriger vers le tableau de bord si déjà connecté
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="flex flex-col items-center">
      <h1>Connexion</h1>
      <button
        onClick={handleGoogleLogin}
        className="bg-blue-600 text-white p-2 rounded"
      >
        Se connecter avec Google
      </button>
    </div>
  );
}
