import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from './encryption.service';
import { Secret } from './secret.entity';

@Injectable()
export class SecretsService {
  constructor(
    private readonly encryptionService: EncryptionService,
    @InjectRepository(Secret)
    private readonly secretsRepository: Repository<Secret>,
  ) {}

  /**
   * Récupère un secret, le décrypte et gère les règles de récupération
   * @param id Identifiant du secret
   * @param password Mot de passe pour déchiffrer
   */
  async processSecrets(id: string, password: string): Promise<any> {
    this.validateInputs(id, password);

    const secret = await this.findSecretById(id);

    await this.validateAndHandleRetrieval(secret);

    const decryptedContent = this.decryptSecret(secret, password);

    const isExpired = await this.handleExpiration(secret);
    if (isExpired) {
      throw new NotFoundException(
        'Secret has expired and is no longer available',
      );
    }

    return this.formatSecretResponse(secret, decryptedContent);
  }

  /**
   * Vérifie les entrées utilisateur
   */
  private validateInputs(id: string, password: string): void {
    if (!id || !password) {
      throw new BadRequestException('ID and password are required');
    }
  }

  /**
   * Récupère un secret par son ID ou lève une exception si introuvable
   */
  private async findSecretById(id: string): Promise<Secret> {
    const secret = await this.secretsRepository.findOneBy({ id });
    if (!secret) {
      throw new NotFoundException('Secret not found');
    }
    return secret;
  }

  /**
   * Valide et gère les règles de récupération du secret
   * @param secret Le secret à traiter
   */
  private async validateAndHandleRetrieval(secret: Secret): Promise<void> {
    if (secret.maxRetrievals !== null) {
      if (secret.maxRetrievals <= 0) {
        await this.secretsRepository.remove(secret); // Supprime si max atteint
        throw new ForbiddenException(
          'This secret has reached its maximum number of retrievals',
        );
      }

      secret.maxRetrievals -= 1;
    }

    secret.retrievalCount += 1;
    await this.secretsRepository.save(secret); // Sauvegarde les modifications
  }

  /**
   * Vérifie si maxRetrievals est valide lors de la création du secret
   */
  public validateMaxRetrievals(maxRetrievals?: number): void {
    if (maxRetrievals !== undefined && maxRetrievals <= 0) {
      throw new BadRequestException(
        `Invalid maxRetrievals value: ${maxRetrievals}. It must be a positive number.`,
      );
    }
  }

  /**
   * Déchiffre un secret ou lève une exception si le mot de passe est invalide
   */
  private decryptSecret(secret: Secret, password: string): string {
    try {
      return this.encryptionService.decrypt(
        secret.encryptedContent,
        password,
        secret.iv,
        secret.salt,
        secret.authTag,
      );
    } catch {
      throw new BadRequestException('Invalid password provided');
    }
  }

  /**
   * Vérifie si un secret est expiré et le supprime si nécessaire
   */
  private async handleExpiration(secret: Secret): Promise<boolean> {
    if (secret.expirationDate && secret.expirationDate < new Date()) {
      await this.secretsRepository.remove(secret);
      return true;
    }
    return false;
  }

  /**
   * Formate la réponse renvoyée au client
   */
  private formatSecretResponse(secret: Secret, content: string): any {
    return {
      id: secret.id,
      content,
      expirationDate: secret.expirationDate,
      maxRetrievals: secret.maxRetrievals,
      retrievalCount: secret.retrievalCount,
    };
  }

  /**
   * Génère une date d'expiration à partir de la durée de vie
   */
  handleLifetime(lifetime?: number): Date | null {
    if (lifetime === undefined || lifetime === null) {
      return null;
    }
    if (lifetime <= 0) {
      throw new BadRequestException('Lifetime must be a positive number');
    }
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + lifetime);
    return expirationDate;
  }
}
