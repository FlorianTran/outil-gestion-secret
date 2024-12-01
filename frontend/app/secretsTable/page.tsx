'use client';

import { SecretsService } from '@/lib/services/secrets-service';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import "../globals.css";

export default function SecretsTable() {
  const { data: session } = useSession();
  const email = session?.user?.email || '';
  const [secrets, setSecrets] = useState<GridRowsProp>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (email) {
      fetchSecrets();
    }
  }, [email, page, pageSize]);

  const fetchSecrets = async () => {
    setLoading(true);
    try {
      const { data, total } = await SecretsService.getUserSecrets(email, page + 1, pageSize);

      setSecrets(
        data.map((secret) => ({
          id: secret.id,
          content: secret.content,
          createdAt: new Date(secret.createdAt).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          maxRetrievals: secret.maxRetrievals,
          retrievalCount: secret.retrievalCount,
          expirationDate: secret.expirationDate ? new Date(secret.expirationDate).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) : '',
        })),
      );
      setTotal(total);
    } catch (error) {
      console.error('Erreur lors du chargement des secrets :', error);
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();

  const handleRetrieve = (id: string) => {
    router.push(`/retrieve?id=${id}`);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Id du secret', flex: 2 },
    { field: 'createdAt', headerName: 'Date de création', flex: 1 },
    { field: 'maxRetrievals', headerName: 'Max récupérations', flex: 1 },
    { field: 'retrievalCount', headerName: 'Récupérations', flex: 1 },
    { field: 'expirationDate', headerName: 'Date d\'expiration', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <button
          onClick={() => handleRetrieve(params.row.id)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '5px',
          }}
        >
          Récupérer
        </button>
      ),
    },
  ];

  return (
    <div style={{ height: 600, width: '80%' }}>
      <h2 className="mb-4">Vos Secrets</h2>
      <DataGrid
        rows={secrets}
        columns={columns}
        rowCount={total}
        paginationModel={{ page: page, pageSize: pageSize }}
        paginationMode="server"
        loading={loading}
        disableColumnFilter
      />
    </div>
  );
}
