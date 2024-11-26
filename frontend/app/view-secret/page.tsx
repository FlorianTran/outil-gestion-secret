"use client";

import { SecretsService } from '@/lib/secrets-service';
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function ViewSecretPage() {
  const searchParams = useSearchParams();
  const secretId = searchParams.get("id");
  const password = searchParams.get("password");

  const [secret, setSecret] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (secretId && password) {
      SecretsService.retrieveSecret({ id: secretId, password })
        .then((data) => {
          setSecret(data.content);
          if (data.file && data.file.originalName) {
            setFileName(data.file.originalName);
          }
        })
        .catch((err) => {
          console.error(err);
          setError(err.response?.data?.message || "Erreur lors de la récupération du secret.");
        });
    }
  }, [secretId, password]);

  const handleDownload = () => {
    if (secretId && password) {
      SecretsService.downloadSecretFile(secretId, password)
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName || `file_${secretId}`;
          a.click();
          window.URL.revokeObjectURL(url);
        })
        .catch((err) => {
          console.error(err);
          setError(err.response?.data?.message || "Erreur lors du téléchargement.");
        });
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
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
          {fileName && (
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
                }}
              >
                Télécharger le fichier
              </button>
            </div>
          )}
        </>
      )}
      <a href="/create">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          style={{ marginTop: "1rem" }}
        >
          Retour
        </button>
      </a>
    </div>
  );
}
