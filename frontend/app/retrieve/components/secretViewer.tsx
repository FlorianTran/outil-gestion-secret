"use client";

import { IpService } from '@/lib/services/ip-service';
import { SecretsService } from '@/lib/services/secrets-service';
import React, { useEffect, useState } from "react";
import { UAParser } from 'ua-parser-js';

interface SecretViewerProps {
  secret: string | null;
  fileName: string | null;
  fileData: string | null; // Base64 file data
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
  }, []);

  // Fonction pour télécharger le fichier
  const handleDownload = () => {
    if (fileData && fileName) {
      const link = document.createElement("a");
      link.href = `data:application/octet-stream;base64,${fileData}`;
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
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Votre secret</h1>
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <>
          {secret && (
            <p>
              <strong>Contenu du secret :</strong> {secret}
            </p>
          )}
          {fileName && fileData && (
            <div>
              <p>
                <strong>Un fichier est associé à ce secret :</strong> {fileName}
              </p>
              <button
                onClick={handleDownload}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#0070f3",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  marginTop: "1rem",
                  borderRadius: "5px",
                }}
              >
                Télécharger le fichier
              </button>
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
        <button
          onClick={deleteSecret}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Supprimer le secret
        </button>
        <button
          onClick={onBack}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Retour
        </button>
      </div>
    </div>
  );
};
