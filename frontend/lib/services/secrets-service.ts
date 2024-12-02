import axios from 'axios';

interface CreateSecretRequest {
  content: string;
  password: string;
  lifetime?: number;
  maxRetrievals?: number;
  file?: File;
}

interface CreateSecretResponse {
  message: string;
  id: string;
}

interface RetrieveSecretRequest {
  id: string;
  password: string;
}

interface RetrieveSecretResponse {
  id: string;
  content: string;
  file: {
    originalName: string;
    data: string; // Base64 encoded file
  } | null;
  expirationDate: string | null;
  maxRetrievals: number | null;
  retrievalCount: number;
  createdAt: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const SecretsService = {
  /**
   * Crée un secret (avec ou sans fichier, avec ou sans utilisateur connecté)
   */
  async createSecret(
    data: CreateSecretRequest,
    session?: { email: string },
  ): Promise<CreateSecretResponse | null> {
    const formData = new FormData();
    formData.append('content', data.content);
    formData.append('password', data.password);

    if (data.lifetime !== undefined) {
      formData.append('lifetime', data.lifetime.toString());
    }

    if (data.maxRetrievals !== undefined) {
      formData.append('maxRetrievals', data.maxRetrievals.toString());
    }

    if (data.file) {
      formData.append('file', data.file);
    }

    if (session?.email) {
      formData.append('createdBy', session.email); // Ajout de l'utilisateur connecté
    }

    try {
      const response = await axios.post<CreateSecretResponse>(
        `${BASE_URL}/secrets/create`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return response.data;
    } catch (error) {
      handleError(error);
      return null;
    }
  },

  /**
   * Récupère un secret par ID
   */
  async retrieveSecret(
    data: RetrieveSecretRequest,
  ): Promise<RetrieveSecretResponse | null> {
    try {
      const response = await axios.post<RetrieveSecretResponse>(
        `${BASE_URL}/secrets/${data.id}`,
        {
          password: data.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      handleError(error);
      return null;
    }
  },

  /**
   * Télécharge un fichier associé à un secret
   */
  async downloadSecretFile(id: string, password: string): Promise<Blob | null> {
    try {
      const response = await axios.post(
        `${BASE_URL}/secrets/${id}/download`,
        { password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          responseType: 'blob',
        },
      );
      return response.data;
    } catch (error) {
      handleError(error);
      return null;
    }
  },

  async getSecretCount(): Promise<number | null> {
    try {
      const response = await axios.get(`${BASE_URL}/secrets/count`);
      return response.data.count;
    } catch (error) {
      handleError(error);
      return null;
    }
  },

  /**
   * Récupère les secrets d'un utilisateur par email
   */
  async getUserSecrets(
    email: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    order: 'ASC' | 'DESC' = 'ASC',
  ): Promise<{ data: RetrieveSecretResponse[]; total: number } | null> {
    try {
      const response = await axios.get<{
        data: RetrieveSecretResponse[];
        total: number;
      }>(`${BASE_URL}/secrets/user-secrets`, {
        params: { email, page, limit, sortBy, order },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      handleError(error);
      return null;
    }
  },

  /**
   * Supprime un secret par ID avec le mot de passe
   */
  async deleteSecret(
    id: string | null,
    password: string | null,
  ): Promise<void> {
    if (!id || !password) {
      console.warn('ID and password are required');
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/secrets/delete/${id}`,
        { password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      handleError(error);
    }
  },
};

/**
 * Fonction pour gérer les erreurs de manière centralisée
 */
function handleError(error: any) {
  if (axios.isAxiosError(error)) {
    // Erreur réseau ou réponse de l'API
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'Erreur inconnue';

      switch (status) {
        case 400:
          console.warn('Mauvaise requête (400): ', message);
          alert('Mauvaise requête (400): ' + message);
          break;
        case 401:
          console.warn('Non autorisé (401): ', message);
          alert('Non autorisé (401): ' + message);
          break;
        case 404:
          console.warn('Ressource non trouvée (404): ', message);
          alert('Ressource non trouvée (404): ' + message);
          break;
        default:
          console.error(`Erreur ${status}: ${message}`);
          break;
      }
    } else if (error.request) {
      // Problème avec la demande (réseau, timeout, etc.)
      console.error('Problème avec la requête:', error.request);
    } else {
      // Autres erreurs
      console.error('Erreur inconnue:', error.message);
    }
  } else {
    console.error('Erreur non liée à Axios:', error);
  }
}
