'use client';

import { useSession } from 'next-auth/react';
import SecretsTable from '../secretsTable/page';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Chargement...</p>;
  }

  if (!session) {
    return <p>Vous devez être connecté pour accéder au tableau de bord.</p>;
  }

  return (
    <div>
      <h1>Bienvenue, {session.user?.name}</h1>
      <SecretsTable />
    </div>
  );
}
