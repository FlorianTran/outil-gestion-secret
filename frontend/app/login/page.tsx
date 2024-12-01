'use client';

import { signIn } from "next-auth/react";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const res = await signIn("google");
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
