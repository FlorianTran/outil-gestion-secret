import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm'; // Algorithme de chiffrement
  private readonly iterations = 100000; // Nombre d'itérations pour la dérivation de clé
  private readonly keyLength = 32; // Longueur de la clé en octets

  /**
   * Chiffre un secret avec un mot de passe
   *
   * @returns {
   * - encrypted: string, // Le secret chiffré
   * - iv: string, // Vecteur d'initialisation nécessaire pour déchiffrer le secret garanti que 2 chiffrages du même secret donneront des résultats différents
   * - salt: string, // Sel utilisé pour dériver la clé
   * - authTag: string // Tag d'authentification nécessaire pour vérifier l'intégrité du secret
   * }
   */
  encrypt(
    secret: string,
    password: string,
  ): { encrypted: string; iv: string; salt: string; authTag: string } {
    const salt = crypto.randomBytes(16).toString('hex'); // Génère un sel pour contrer les attaques par rainbow table
    const iv = crypto.randomBytes(12); // Génère un vecteur d'initialisation (IV) pour garentir l'unicité du chiffrement

    // Dérive une clé à partir du mot de passe et du sel avec PBKDF2
    const key = crypto.pbkdf2Sync(
      password,
      salt,
      this.iterations,
      this.keyLength,
      'sha256',
    );

    // Chiffre le secret avec AES
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(secret, 'utf8'),
      cipher.final(),
    ]);

    return {
      encrypted: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      salt,
      authTag: cipher.getAuthTag().toString('hex'),
    };
  }

  /**
   * Déchiffre un secret avec un mot de passe.
   *
   * @returns Secret déchiffré
   */
  decrypt(
    encrypted: string,
    password: string,
    iv: string,
    salt: string,
    authTag: string,
  ): string {
    // Dérive une clé à partir du mot de passe et du sel
    const key = crypto.pbkdf2Sync(
      password,
      salt,
      this.iterations,
      this.keyLength,
      'sha256',
    );

    // Déchiffre le secret avec AES
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(iv, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'hex')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }
}
