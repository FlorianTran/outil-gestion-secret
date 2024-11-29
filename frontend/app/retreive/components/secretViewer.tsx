"use client";

import React from "react";

interface SecretViewerProps {
  secret: string | null;
  fileName: string | null;
  fileData: string | null; // Base64 file data
  onBack: () => void;
  error?: string | null;
}

export const SecretViewer: React.FC<SecretViewerProps> = ({ secret, fileName, fileData, onBack, error }) => {
  const handleDownload = () => {
    if (fileData && fileName) {
      const link = document.createElement("a");
      link.href = `data:application/octet-stream;base64,${fileData}`;
      link.download = fileName;
      link.click();
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
                }}
              >
                Télécharger le fichier
              </button>
            </div>
          )}
        </>
      )}
      <button
        onClick={onBack}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        style={{ marginTop: "1rem" }}
      >
        Retour
      </button>
    </div>
  );
};
