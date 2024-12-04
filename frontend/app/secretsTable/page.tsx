'use client';

import { SecretsService } from '@/lib/services/secrets-service';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import "../globals.css";
import { Button } from '@mui/material';

export default function SecretsTable() {
  const { data: session } = useSession();
  const email = session?.user?.email || '';
  const [secrets, setSecrets] = useState<GridRowsProp>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); // Les pages commencent à 0 pour le DataGrid
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
      const response = await SecretsService.getUserSecrets(email, page + 1, pageSize); // Le backend commence à 1

      // Vérifie que la réponse contient les données attendues
      if (response && response.data && response.total !== undefined) {
        const { data, total } = response;

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
            expirationDate: secret.expirationDate
              ? new Date(secret.expirationDate).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
              : '',
          })),
        );
        setTotal(total);
      } else {
        console.error('Données manquantes dans la réponse de l\'API');
      }
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
        <div className="flex items-center justify-center">
          <Button onClick={() => handleRetrieve(params.row.id)}>
            Récupérer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="h-[600px] w-[90%] mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-[var(--font)]">Vos Secrets</h2>
      <DataGrid
        rows={secrets}
        rowHeight={60}
        columns={columns}
        rowCount={total}
        pageSizeOptions={[5, 10, 20]} // Options de tailles de pages
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={(model) => {
          setPage(model.page);
          setPageSize(model.pageSize);
        }}
        paginationMode="server" // Pagination côté serveur
        loading={loading}
        disableColumnFilter
      />
    </div>
  );
}
