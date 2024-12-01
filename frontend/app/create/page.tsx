"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

export default function CreatePage() {
    const [content, setContent] = useState("");
    const [password, setPassword] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [lifetime, setLifetime] = useState<number | null>(null);
    const [maxRetrievals, setMaxRetrievals] = useState<number | null>(null);
    const [isFormValid, setIsFormValid] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const isValid = content !== "" && password !== "" && (lifetime === null || lifetime > 0) && (maxRetrievals === null || maxRetrievals > 0);
        setIsFormValid(isValid);
    }, [content, password, lifetime, maxRetrievals]);

    const handleCreateSecret = async (event: React.FormEvent) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("content", content);
        formData.append("password", password);
        if (file) {
            formData.append("file", file);
        }
        if (lifetime !== null) {
            formData.append("lifetime", lifetime.toString());
        }
        if (maxRetrievals !== null) {
            formData.append("maxRetrievals", maxRetrievals.toString());
        }

        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/secrets/create", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to create secret");
            }

            const data = await response.json();
            // Redirigez vers la page de confirmation avec l'ID du secret créé
            router.push(`/confirmation?id=${data.id}`);
        } catch (error) {
            console.error("Error creating secret:", error);
        }
    };

    return (
        <div>
            <form onSubmit={handleCreateSecret} className='text-blue-400'>
                <h1>Création de secret</h1>
                <input
                    type="text"
                    placeholder="Contenu du secret"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                />
                <input
                    type="number"
                    placeholder="Durée (jours)"
                    value={lifetime ?? ""}
                    onChange={(e) => setLifetime(parseInt(e.target.value, 10) || null)}
                    min="1"
                />
                <input
                    type="number"
                    placeholder="Maximum de récupérations"
                    value={maxRetrievals ?? ""}
                    onChange={(e) => setMaxRetrievals(parseInt(e.target.value, 10) || null)}
                    min="1"
                />
                <button type="submit" disabled={!isFormValid} style={{ backgroundColor: isFormValid ? 'blue' : 'gray' }}>
                    Créer un secret
                </button>
            </form>
            <a href="/retreive">
                Récupérer un secret
            </a>
        </div>
    );
}
