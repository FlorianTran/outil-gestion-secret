"use client";

import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from "react";

interface RetrieveFormProps {
  onSubmit: (id: string, password: string) => void;
  error?: string | null;
}

export const RetrieveForm: React.FC<RetrieveFormProps> = ({ onSubmit, error }) => {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get("id") || "";

  const [secretId, setSecretId] = useState(idFromUrl);
  const [password, setPassword] = useState("");

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSecretId(text);
    } catch (err) {
      console.log("Impossible de coller depuis le presse-papiers :", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretId && password) {
      onSubmit(secretId, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h1>Récupérer un secret</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <label htmlFor="secretId">ID du secret :</label>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          id="secretId"
          value={secretId}
          onChange={(e) => setSecretId(e.target.value)}
          placeholder="Entrez ou collez l'ID ici"
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button
          type="button"
          onClick={handlePaste}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Coller
        </button>
      </div>

      <label htmlFor="password">Mot de passe :</label>
      <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Entrez votre mot de passe"
        style={{ padding: "0.5rem" }}
      />

      <button
        type="submit"
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginTop: "1rem",
        }}
      >
        Récupérer le secret
      </button>
    </form>
  );
};
