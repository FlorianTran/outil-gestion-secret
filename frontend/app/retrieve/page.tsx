"use client";

import { SecretsService } from '@/lib/services/secrets-service';
import React, { useState } from "react";
import { RetrieveForm } from './components/retreiveForm';
import { SecretViewer } from './components/secretViewer';

export default function RetrievePage() {
    const [secret, setSecret] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileData, setFileData] = useState<string | null>(null); // For base64 file
    const [error, setError] = useState<string | null>(null);
    const [isSecretView, setIsSecretView] = useState(false);
    const [password, setPassword] = useState<string | null>(null);
    const [id, setId] = useState<string | null>(null);

    const handleRetrieve = async (id: string, password: string) => {
        setError(null);
        try {
            setPassword(password);
            setId(id);
            const data = await SecretsService.retrieveSecret({ id, password });
            setSecret(data.content);
            if (data.file) {
                setFileName(data.file.originalName);
                setFileData(data.file.data); // Base64 encoded
            }
            setIsSecretView(true);
        } catch (err) {
            console.error(err);
            setError("Erreur lors de la récupération du secret.");
        }
    };

    const handleBack = () => {
        setIsSecretView(false);
        setSecret(null);
        setFileName(null);
        setFileData(null);
        setError(null);
    };

    return (
        <div>
            {!isSecretView ? (
                <RetrieveForm onSubmit={handleRetrieve} error={error} />
            ) : (
                <SecretViewer
                    secret={secret}
                    fileName={fileName}
                    fileData={fileData}
                    onBack={handleBack}
                    error={error}
                    password={password}
                    id={id}
                />
            )}
        </div>
    );
}
