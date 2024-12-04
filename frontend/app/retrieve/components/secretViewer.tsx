"use client";

import { IpService } from '@/lib/services/ip-service';
import { SecretsService } from '@/lib/services/secrets-service';
import React, { useEffect } from "react";
import { FaFile, FaDownload, FaTrashAlt } from "react-icons/fa";

interface SecretViewerProps {
  secret: string | null;
  fileName: string | null;
  fileData: string | null;
  onBack: () => void;
  error?: string | null;
  password: string | null;
  id: string | null;
}

//! Dans react 18 en mode développement, les hooks d'effet sont exécutés deux fois
export const SecretViewer: React.FC<SecretViewerProps> = ({
  secret,
  fileName,
  fileData,
  onBack,
  error,
  password,
  id,
}) => {
  // Effect pour récupérer le User Agent et notifier l'accès
  useEffect(() => {
    const notifyAccess = async () => {
      try {
        if (id) {
          await IpService.notifyAccess(id);
        } else {
          console.error("ID manquant pour la notification d'accès.");
        }
      } catch (err) {
        console.error("Erreur lors de la notification d'accès :", err);
      }
    };

    notifyAccess(); // Appel asynchrone encapsulé
  }, [id]);

  // Fonction pour télécharger le fichier
  const handleDownload = () => {
    if (fileData && fileName) {
      // Création d'un lien de téléchargement
      const link = document.createElement("a");
      // Encodage en base64
      link.href = `data:application/octet-stream;base64,${fileData}`;
      // Téléchargement forcé
      link.download = fileName;
      link.click();
    } else {
      alert("Aucun fichier disponible pour le téléchargement.");
    }
  };

  // Fonction pour supprimer un secret
  const deleteSecret = async () => {
    if (!password || !id) {
      alert("Mot de passe ou ID manquant.");
      return;
    }

    try {
      await SecretsService.deleteSecret(id, password);
      alert('Le secret a été supprimé avec succès.');
      onBack(); // Retour à la liste ou page précédente
    } catch (err) {
      console.error('Erreur lors de la suppression du secret :', err);
      alert('Impossible de supprimer le secret.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[var(--background)]">
      <div className="w-full max-w-3xl bg-[var(--background)] border border-[var(--border)] rounded-md p-6">
        <h1 className="text-2xl font-semibold text-[var(--foreground)] text-center mb-6">Votre secret</h1>
        {error ? (
          <p className="text-[var(--error)] text-center">{error}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {secret && (
              <p className="text-[var(--font)]">
                <strong>Contenu du secret :</strong> {secret}
              </p>
            )}
            {fileName && fileData && (
              <div>
                <p className='mb-3'>Un fichier est associé à ce secret :</p>
                <div className="flex items-center gap-4 bg-[var(--inside-background)] p-4 rounded-md">
                  <FaFile className="text-[var(--font)]" size={24} />
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <p className="text-[var(--font)]">
                        {fileName}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={handleDownload}
                        className="flex items-center justify-center text-[var(--font)] transition-transform transform hover:scale-110"
                      >
                        <FaDownload size={20} />
                      </button>
                      <button
                        onClick={deleteSecret}
                        className="flex items-center justify-center hover:text-[var(--error)] transition-transform transform hover:scale-110"
                      >
                        <FaTrashAlt size={20} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-4 justify-center">
          <button
            onClick={onBack}
            className="bg-[var(--button-bg)] hover:bg-[var(--button-hover)] text-[var(--button-font)] py-2 px-4 rounded"
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  );
};
