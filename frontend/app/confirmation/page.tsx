"use client";

import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { FiCheck, FiClipboard } from "react-icons/fi";

export default function ConfirmationPage() {
  const [copied, setCopied] = useState(false);

  const searchParams = useSearchParams();
  const secretId = searchParams.get("id");

  const handleCopy = () => {
    if (secretId) {
      navigator.clipboard.writeText(secretId).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Réinitialise après 2 secondes
      });
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Secret créé avec succès !</h1>
      <p>Votre secret a été créé avec succès.</p>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <p>
          <strong>ID du secret :</strong> {secretId}
        </p>
        {secretId && (
          <div
            onClick={handleCopy}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            title="Copier dans le presse-papiers"
          >
            {copied ? (
              <>
                <FiCheck color="green" size={20} />
                <span>Copié !</span>
              </>
            ) : (
              <>
                <FiClipboard size={20} />
                <span>Copier</span>
              </>
            )}
          </div>
        )}
      </div>

      <p>
        Gardez cet ID en sécurité ! Vous en aurez besoin pour récupérer votre secret.
        Il ne sera plus affiché par la suite.
      </p>
      <a href="/create" style={{ color: "blue" }}>
        Retour à l&apos;accueil
      </a>
    </div>
  );
}
