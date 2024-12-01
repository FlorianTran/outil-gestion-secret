import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from './encryption.service';
import { SecretFile } from './secret-file.entity';
import { Secret } from './secret.entity';

@Injectable()
export class SecretsService {
  constructor(
    private readonly encryptionService: EncryptionService,
    @InjectRepository(Secret)
    private readonly secretsRepository: Repository<Secret>,
    @InjectRepository(SecretFile)
    private readonly secretFileRepository: Repository<SecretFile>,
  ) {}

  /**
   * Crée un secret et le stocke en base de données
   */
  async createSecret(
    content: string,
    file: Express.Multer.File | undefined,
    password: string,
    lifetime?: number,
    maxRetrievals?: number,
    createdBy?: string | null,
  ): Promise<Secret> {
    const textEncryption = this.encryptionService.encrypt(content, password);

    let secretFileEntity: SecretFile | undefined;

    if (file) {
      const encryptedFile = this.encryptSecretFile(file, password);
      // Crée l'entité SecretFile mais ne la sauvegarde pas encore
      secretFileEntity = this.secretFileRepository.create({
        data: Buffer.from(encryptedFile.encrypted, 'base64'),
        originalFileName: encryptedFile.originalFileName,
        encryptionDetails: {
          iv: encryptedFile.iv,
          salt: encryptedFile.salt,
          authTag: encryptedFile.authTag,
        },
      });
    }

    const expirationDate = this.handleLifetime(lifetime);

    const createdAt = new Date();

    const secret = this.secretsRepository.create({
      encryptedContent: textEncryption.encrypted,
      encryptionDetails: {
        iv: textEncryption.iv,
        salt: textEncryption.salt,
        authTag: textEncryption.authTag,
      },
      expirationDate,
      maxRetrievals,
      file: secretFileEntity, // Associe directement le fichier
      createdBy: createdBy || null,
      createdAt,
    });

    // Sauvegarde le secret principal et son fichier lié dans une seule transaction
    return await this.secretsRepository.save(secret);
  }

  /**
   * Chiffre un fichier et retourne le contenu chiffré
   * @param file Fichier à chiffrer
   * @param password Mot de passe pour le chiffrement
   *
   * @returns Contenu chiffré du fichier
   */
  encryptSecretFile(file: Express.Multer.File, password: string): any {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file buffer provided.');
    }

    const encryptedFile = this.encryptionService.encrypt(
      file.buffer.toString('base64'),
      password,
    );

    return {
      encrypted: encryptedFile.encrypted,
      iv: encryptedFile.iv,
      salt: encryptedFile.salt,
      authTag: encryptedFile.authTag,
      originalFileName: file.originalname || 'unknown_file',
    };
  }

  /**
   * Récupère un secret, le décrypte et gère les règles de récupération
   * @param id Identifiant du secret
   * @param password Mot de passe pour déchiffrer
   */
  async retrieveSecret(
    id: string,
    password: string,
    isDownload: boolean,
  ): Promise<any> {
    this.validateInputs(id, password);

    const secret = await this.findSecretById(id);

    const decryptedContent = this.decryptSecret(secret, password);

    if (!isDownload) {
      await this.validateAndHandleRetrieval(secret);
    }

    let secretFileData: Buffer | undefined;

    // Si le secret contient un fichier
    if (secret.file) {
      const decryptedFileContent = this.decryptSecretFile(
        secret.file,
        password,
      );

      // Transforme le contenu déchiffré en Buffer
      secretFileData = Buffer.from(decryptedFileContent, 'base64');
    }

    // Vérifie si le secret a expiré
    const isExpired = await this.handleExpiration(secret);
    if (isExpired) {
      throw new NotFoundException(
        'Secret has expired and is no longer available',
      );
    }

    // Retourne la réponse formatée avec le texte déchiffré et le fichier, s'il existe
    return this.formatSecretResponse(secret, decryptedContent, secretFileData);
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
    const secret = await this.secretsRepository.findOne({
      where: { id },
      relations: ['file'], // Charge la relation avec SecretFile
    });

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
        await this.secretsRepository.remove(secret);
        throw new ForbiddenException(
          'This secret has reached its maximum number of retrievals',
        );
      }

      secret.maxRetrievals -= 1;
    }

    secret.retrievalCount += 1;
    await this.secretsRepository.save(secret);
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
        secret.encryptionDetails.iv,
        secret.encryptionDetails.salt,
        secret.encryptionDetails.authTag,
      );
    } catch (error) {
      throw new BadRequestException(`Invalid password provided: ${error}`);
    }
  }

  private decryptSecretFile(secretFile: SecretFile, password: string): string {
    try {
      return this.encryptionService.decrypt(
        secretFile.data.toString('base64'),
        password,
        secretFile.encryptionDetails.iv,
        secretFile.encryptionDetails.salt,
        secretFile.encryptionDetails.authTag,
      );
    } catch (error) {
      throw new BadRequestException(
        `Invalid password provided for file decryption: ${error}`,
      );
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
  private formatSecretResponse(
    secret: Secret,
    content: string,
    secretFileData?: Buffer | null,
  ): any {
    return {
      id: secret.id,
      content,
      file: secretFileData
        ? {
            originalName: secret.file.originalFileName,
            data: secretFileData.toString('base64'),
          }
        : null,
      expirationDate: secret.expirationDate,
      maxRetrievals: secret.maxRetrievals,
      retrievalCount: secret.retrievalCount,
      createdAt: secret.createdAt,
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

  // Méthode pour obtenir le nombre de secrets
  async getSecretCount(): Promise<number> {
    return await this.secretsRepository.count();
  }

  /**
   * Récupère les secrets d'un utilisateur avec pagination et tri
   */
  async getUserSecrets(
    email: string,
    page: number,
    limit: number,
    sortBy: string,
    order: 'ASC' | 'DESC',
  ): Promise<{ data: Secret[]; total: number }> {
    const [data, total] = await this.secretsRepository.findAndCount({
      where: { createdBy: email },
      order: { [sortBy]: order },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { data, total };
  }
}
