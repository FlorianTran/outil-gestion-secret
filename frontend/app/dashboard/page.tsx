'use client';

import { signOut, useSession } from 'next-auth/react';
import SecretsTable from '../secretsTable/page';
import { FaSignOutAlt } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { SecretsService } from '@/lib/services/secrets-service';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [secretsCount, setSecretsCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Utilisation d'un useEffect pour gérer la récupération des secrets
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

    if (session) {
      fetchSecretCount();
    }
  }, [session]);

  // Gestion du statut de chargement
  if (status === 'loading') {
    return <p>Chargement...</p>;
  }

  // Gestion de l'absence de session
  if (!session) {
    return <p>Vous devez être connecté pour accéder au tableau de bord.</p>;
  }

  return (
    <div className='flex h-full w-full justify-between items-center gap-x-4 border-t-[1px] border-[var(--border)]'>
      <div className='flex flex-col p-6 h-full w-1/4 justify-between bg-[var(--inside-background)]'>
        <div>
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <p className="">
                Acutellement le nombre de Secrets est de : <strong className='text-[var(--accent)]'>{secretsCount ?? "Chargement..."}</strong>
            </p>
          )}
        </div>

        <button
          onClick={() => signOut()} // Déconnexion avec `next-auth`
          className="flex items-center ml-auto text-[var(--font)] hover:text-[var(--error)] transition-colors gap-2"
        >
          <FaSignOutAlt /> <span>Déconnexion</span>
        </button>
      </div>
      <div className='flex flex-col gap-8 w-full h-full p-8'>
        <h1>Bienvenue, {session.user?.name}</h1>
        <SecretsTable />
      </div>
    </div>
  );
}
