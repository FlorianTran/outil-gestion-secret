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
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const SecretsService = {
  /**
   * Crée un secret (avec ou sans fichier)
   */
  async createSecret(data: CreateSecretRequest): Promise<CreateSecretResponse> {
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

    const response = await axios.post<CreateSecretResponse>(
      `${BASE_URL}/secrets/create`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  /**
   * Récupère un secret par ID
   */
  async retrieveSecret(data: RetrieveSecretRequest): Promise<RetrieveSecretResponse> {
    const response = await axios.post<RetrieveSecretResponse>(
      `${BASE_URL}/secrets/${data.id}`,
      {
        password: data.password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  },

  /**
   * Télécharge un fichier associé à un secret
   */
  async downloadSecretFile(id: string, password: string): Promise<Blob> {
    const response = await axios.post(`${BASE_URL}/secrets/${id}/download`, { password }, {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'blob',
    });

    return response.data;
  },
};
