'use client';

import { useSession, signOut } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session } = useSession();

  if (!session) {
    return <p>Chargement...</p>;
  }

  return (
    <div>
      <h1>Bienvenue, {session.user?.name}</h1>
      <button onClick={() => signOut()}>Se déconnecter</button>
    </div>
  );
}
