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
      file: secretFileEntity,
      createdBy: createdBy || null,
      createdAt,
    });

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
      throw new BadRequestException('Le fichier est manquant ou invalide.');
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
      originalFileName: file.originalname || 'fichier_inconnu',
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
    try {
      this.validateInputs(id, password);

      const secret = await this.findSecretById(id);
      if (!secret) {
        throw new NotFoundException('Secret non trouvé');
      }

      const decryptedContent = this.decryptSecret(secret, password);

      if (!isDownload) {
        await this.validateAndHandleRetrieval(secret);
      }

      let secretFileData: Buffer | undefined;

      if (secret.file) {
        const decryptedFileContent = this.decryptSecretFile(
          secret.file,
          password,
        );

        // Transforme le contenu déchiffré en Buffer
        secretFileData = Buffer.from(decryptedFileContent, 'base64');
      }

      const isExpired = await this.handleExpiration(secret);
      if (isExpired) {
        throw new NotFoundException(
          "Le secret a expiré et n'est plus disponible",
        );
      }

      return this.formatSecretResponse(
        secret,
        decryptedContent,
        secretFileData,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Vérifie les entrées utilisateur
   */
  private validateInputs(id: string, password: string): void {
    if (!id || !password) {
      throw new BadRequestException("L'ID et le mot de passe sont requis");
    }
  }

  /**
   * Récupère un secret par son ID ou lève une exception si introuvable
   */
  public async findSecretById(id: string): Promise<Secret> {
    const secret = await this.secretsRepository.findOne({
      where: { id },
      relations: ['file'], // Charge la relation avec SecretFile
    });

    if (!secret) {
      return null;
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
          'Ce secret a atteint son nombre maximal de récupérations',
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
        `La valeur de maxRetrievals est invalide : ${maxRetrievals}. Elle doit être un nombre positif.`,
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
    } catch {
      throw new BadRequestException('Mot de passe invalide');
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
        `Mot de passe invalide pour le déchiffrement du fichier : ${error}`,
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
      throw new BadRequestException(
        'La durée de vie doit être un nombre positif',
      );
    }
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + lifetime);
    return expirationDate;
  }

  /**
   * Récupère le nombre total de secrets stockés
   */
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
    const queryBuilder = this.secretsRepository.createQueryBuilder('secret');
    queryBuilder.where('secret.createdBy = :email', { email });

    if (sortBy) {
      queryBuilder.orderBy(`secret.${sortBy}`, order);
    }

    // Calcule le nombre total de secrets avant la pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    // Récupère les secrets et le nombre total
    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  /**
   * Supprime un secret
   */
  async deleteSecret(id: string, password: string): Promise<boolean> {
    const secret = await this.findSecretById(id);
    if (!secret) {
      throw new NotFoundException('Secret non trouvé');
    }

    try {
      this.decryptSecret(secret, password);
    } catch {
      return false;
    }

    await this.secretsRepository.remove(secret);

    return true;
  }
}
