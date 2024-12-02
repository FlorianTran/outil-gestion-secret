import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const IpService = {
  /**
   * Notifie le backend de l'accès à un secret
   */
  async notifyAccess(id: string): Promise<void> {
    try {
      await axios.post(
        `${BASE_URL}/access/notify/${id}`,
        {}, // Aucun body nécessaire
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (err) {
      console.error("Erreur lors de la notification d'accès :", err);
      throw err; // Ajoute une exception pour propager l'erreur
    }
  },
};
