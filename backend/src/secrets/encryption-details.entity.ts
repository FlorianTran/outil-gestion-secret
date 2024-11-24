import { Column } from 'typeorm';

export class EncryptionDetails {
  @Column()
  salt: string; // Sel utilisé pour dériver la clé à partir du mot de passe

  @Column()
  iv: string; // Vecteur d'initialisation utilisé pour AES

  @Column()
  authTag: string; // Tag d'authentification pour AES-GCM
}
