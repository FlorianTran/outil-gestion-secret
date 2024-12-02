"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SecretsService } from '@/lib/services/secrets-service';

export default function CreatePage() {
    const [content, setContent] = useState("");
    const [password, setPassword] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [lifetime, setLifetime] = useState<number | null>(null);
    const [maxRetrievals, setMaxRetrievals] = useState<number | null>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const handleCreateSecret = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        console.log('session', session);
        try {
            // Appelle le service pour créer le secret
            const response = await SecretsService.createSecret(
                {
                    content,
                    password,
                    lifetime: lifetime ?? undefined,
                    maxRetrievals: maxRetrievals ?? undefined,
                    file: file ?? undefined,
                },
                session ? { email: session.user?.email || "" } : undefined // Passe l'email si connecté
            );

            // Redirige vers la page de confirmation
            if (response) {
                router.push(`/confirmation?id=${response.id}`);
            } else {
                setError("Une erreur est survenue lors de la création du secret.");
            }
        } catch (error: any) {
            console.error("Error creating secret:", error);
            setError(
                error?.response?.data?.message || "Une erreur est survenue lors de la création du secret."
            );
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold">Créer un secret</h1>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleCreateSecret} className="space-y-4">
                <input
                    type="text"
                    placeholder="Contenu du secret"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className="border p-2 w-full"
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border p-2 w-full"
                />
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    className="p-2 w-full"
                />
                <input
                    type="number"
                    placeholder="Durée (jours)"
                    value={lifetime ?? ""}
                    onChange={(e) => setLifetime(parseInt(e.target.value, 10) || null)}
                    min="1"
                    className="border p-2 w-full"
                />
                <input
                    type="number"
                    placeholder="Maximum de récupérations"
                    value={maxRetrievals ?? ""}
                    onChange={(e) => setMaxRetrievals(parseInt(e.target.value, 10) || null)}
                    min="1"
                    className="border p-2 w-full"
                />
                <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`p-2 w-full ${isFormValid ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                        }`}
                >
                    Créer un secret
                </button>
            </form>
            <div className="mt-4">
                <a href="/retrieve" className="text-blue-600 underline">
                    Récupérer un secret
                </a>
            </div>
        </div>
    );
}
