'use client';

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SecretsService } from '@/lib/services/secrets-service';
import { FileUploader } from "react-drag-drop-files";
import { FaFile } from 'react-icons/fa';

export default function CreatePage() {
    const [content, setContent] = useState("");
    const [password, setPassword] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [lifetime, setLifetime] = useState<number | null>(null);
    const [maxRetrievals, setMaxRetrievals] = useState<number | null>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [contentTouched, setContentTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();

    // Validation du formulaire
    useEffect(() => {
        const isValid =
            content !== "" &&
            password !== "" &&
            (lifetime === null || lifetime > 0) &&
            (maxRetrievals === null || maxRetrievals > 0);
        setIsFormValid(isValid);
    }, [content, password, lifetime, maxRetrievals]);

    //! Warning avec le composnat FileUploader: Received `false` for a non-boolean attribute `error`.
    //! Problème récurrent mais non bloquant, le composant fonctionne correctement.
    const handleChange = (file: File) => {
        setFile(file);
    };

    const handleCreateSecret = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await SecretsService.createSecret(
                {
                    content,
                    password,
                    lifetime: lifetime ?? undefined,
                    maxRetrievals: maxRetrievals ?? undefined,
                    file: file ?? undefined,
                },
                session ? { email: session.user?.email || "" } : undefined
            );

            if (response) {
                router.push(`/confirmation?id=${response.id}`);
            } else {
                setError("Une erreur est survenue lors de la création du secret.");
            }
        } catch (error: any) {
            console.error("Error creating secret:", error);
            setError(error?.response?.data?.message || "Une erreur est survenue lors de la création du secret.");
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-32 p-6 max-w-6xl mx-auto ">
            <h1 className="text-6xl font-bold text-[var(--font)] mb-10">Créer un secret</h1>
            {error && <p className="text-red-500 mt-2">{error}</p>}

            <form onSubmit={handleCreateSecret} className="space-y-6 mt-6 flex flex-col">
                <div className='flex flex-row justify-evenly gap-6 mb-10'>
                    <div className='flex flex-col w-full gap-5'>
                        {/* Contenu du secret */}
                        <div>
                            <label htmlFor="content" className="block text-[var(--font)] font-medium">Contenu*</label>
                            <input
                                id="content"
                                type="text"
                                placeholder="Entrez le contenu du secret..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onBlur={() => setContentTouched(true)}
                                required
                                className={`border p-3 w-full rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] 
                                    ${contentTouched && !content ? 'border-red-500' : 'border-[var(--border)]'}
                                    bg-[var(--input-bg)]`}
                            />
                            {contentTouched && !content && <p className="text-red-500 text-sm">Ce champ est requis</p>}
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label htmlFor="password" className="block text-[var(--font)] font-medium">Mot de passe*</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Créez un mot de passe..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={() => setPasswordTouched(true)}
                                required
                                className={`border p-3 w-full rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] 
                                    ${passwordTouched && !password ? 'border-red-500' : 'border-[var(--border)]'}
                                    bg-[var(--input-bg)]`}
                            />
                            {passwordTouched && !password && <p className="text-red-500 text-sm">Ce champ est requis</p>}
                        </div>

                        <div className='flex flex-row items-center justify-between'>
                            {/* Durée */}
                            <div>
                                <label htmlFor="lifetime" className="block text-[var(--font)] font-medium">Durée de validité</label>
                                <input
                                    id="lifetime"
                                    type="number"
                                    placeholder="Durée (en jours)"
                                    value={lifetime ?? ""}
                                    onChange={(e) => setLifetime(parseInt(e.target.value, 10) || null)}
                                    min="1"
                                    className="border p-3 w-full rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--input-bg)] border-[var(--border)]"
                                />
                            </div>

                            {/* Nombre maximum de récupérations */}
                            <div>
                                <label htmlFor="maxRetrievals" className="block text-[var(--font)] font-medium">Limite de récupérations</label>
                                <input
                                    id="maxRetrievals"
                                    type="number"
                                    placeholder="Nombre de récupérations"
                                    value={maxRetrievals ?? ""}
                                    onChange={(e) => setMaxRetrievals(parseInt(e.target.value, 10) || null)}
                                    min="1"
                                    className="border p-3 w-full rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--input-bg)] border-[var(--border)]"
                                />
                            </div>

                        </div>
                    </div>

                    <div className='w-full'>
                        {/* Fichier avec Drag and Drop */}
                        <p className="text-[var(--font)] font-medium mb-4">Télécharger un fichier</p>

                        {file ? (
                            <div className="flex items-center space-x-2 border-[1px] border-[var(--boder)] p-4 rounded-lg bg-[var(--inside-background)]">
                                <FaFile className="h-5 w-5 text-[var(--font)]" />
                                <p className="text-[var(--font)]">Fichier sélectionné: {file.name}</p>
                            </div>
                        ) : (
                            <FileUploader
                                handleChange={handleChange}
                                name="file"
                                label="Glissez-déposez ou cliquez pour sélectionner"
                                hoverTitle="Déposez ici."
                                classes="fileUploader"
                            />
                        )}
                    </div>
                </div>
                <div className='w-full flex items-center justify-center'>
                    <button
                        type="submit"
                        disabled={!isFormValid || isLoading}  // Désactive le bouton pendant le chargement
                        className={`w-1/3 py-3 rounded-md mt-4 border-[1px] ${isFormValid && !isLoading ?
                            "bg-[var(--button-bg)] border-[var(--button-bg)] text-[var(--button-font)] hover:bg-[var(--button-hover)] focus:bg-[var(--button-focus)]" :
                            "bg-[var(--background)] text-[var(--disabled-font)] cursor-not-allowed border-[var(--disabled-border)]"}`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="loader"></span>
                            </div>
                        ) : (
                            "Créer un secret"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
