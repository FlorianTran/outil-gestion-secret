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
    <div className="flex justify-center items-center bg-background mt-12">
      <div className="flex flex-col gap-11 w-full max-w-5xl bg-card-background border border-[var(--border)] rounded-xl p-8">
        <h1 className="text-5xl font-semibold text-foreground">Secret créé avec succès !</h1>
        <div className='flex flex-col gap-4'>
          <div className="flex flex-col items-start gap-4 mt-4 w-full">
            <p className='font-semibold'>ID du secret:</p>
            <div className='flex w-full gap-6 items-center justify-between bg-[var(--inside-background)] p-2 px-6 rounded-md'>
              <p className="text-font">
                {secretId}
              </p>
              {secretId && (
                <div
                  onClick={handleCopy}
                  className="cursor-pointer flex items-center gap-2 text-primary hover:text-primary-hover font-semibold text-[var(--secondary-font)]"
                  title="Copier dans le presse-papiers"
                >
                  {copied ? (
                    <>
                      <FiCheck className="text-success text-[var(--secondary-font)]" size={20} />
                      <span className="text-success text-[var(--secondary-font)]">Copié !</span>
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
          </div>

            <p className="mt-4 text-secondary-font">
            Gardez cet ID en sécurité !<br />
            Vous en aurez besoin pour récupérer votre secret.
            Il ne sera plus affiché par la suite sauf si vous êtes connecté.
            </p>
          <a href="/create" className="w-40 p-3 rounded-md mt-4 bg-[var(--button-bg)] text-[var(--button-font)] hover:bg-[var(--button-hover)] focus:bg-[var(--button-focus)]">
            Retour à l&apos;accueil
          </a>
        </div>
      </div>
    </div>
  );
}
