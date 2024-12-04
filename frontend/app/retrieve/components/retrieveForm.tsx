"use client";

import { useSearchParams } from 'next/navigation';
import React, { useState } from "react";

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
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-xl flex flex-col gap-6 p-6 border border-[var(--border)] rounded-md bg-[var(--inside-background)]">
        <h1 className="text-2xl font-semibold text-[var(--foreground)] text-center">Récupérer un secret</h1>
        {error && <p className="text-[var(--error)] text-center">{error}</p>}

        <div>
          <label htmlFor="secretId" className="block font-medium text-[var(--secondary-font)] mb-2">ID du secret :</label>
          <div className="flex gap-2">
            <input
              type="text"
              id="secretId"
              value={secretId}
              onChange={(e) => setSecretId(e.target.value)}
              placeholder="Entrez ou collez l'ID ici"
              className="flex-1 p-2 border border-[var(--input-border)] bg-[var(--input-bg)] rounded text-[var(--font)] placeholder-[var(--placeholder)] focus:outline-none focus:border-[var(--input-focus)]"
            />
            <button
              type="button"
              onClick={handlePaste}
              className="px-4 py-2 bg-[var(--secondary-button-bg)] text-[var(--secondary-button-font)] rounded hover:bg-[var(--secondary-button-hover)] focus:bg-[var(--secondary-button-hover)]"
            >
              Coller
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block font-medium text-[var(--secondary-font)] mb-2">Mot de passe :</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Entrez votre mot de passe"
            className="w-full p-2 border border-[var(--input-border)] bg-[var(--input-bg)] rounded text-[var(--font)] placeholder-[var(--placeholder)] focus:outline-none focus:border-[var(--input-focus)]"
          />
        </div>

        <div className='flex flex-col w-full items-center'>
          <button
            type="submit"
            disabled={!secretId || !password}
            className={`w-[50%] py-3 bg-[var(--button-bg)] text-[var(--button-font)] rounded transition-opacity ${!secretId || !password
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-[var(--button-hover)] focus:bg-[var(--button-hover)]'
              }`}
          >
            Récupérer le secret
          </button>
        </div>
      </form>
    </div>
  );
};
