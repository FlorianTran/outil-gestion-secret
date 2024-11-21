import { Injectable, NotFoundException } from '@nestjs/common';
import { Secret } from './secret.entity';
import { Repository } from 'typeorm';
import { EncryptionService } from './encryption.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SecretsService {
  constructor(
    private readonly encryptionService: EncryptionService,
    @InjectRepository(Secret) private secretsRepository: Repository<Secret>,
  ) {}

  async processSecrets(id: string, password: string): Promise<any> {
    const secret: Secret = await this.secretsRepository.findOneBy({ id });

    if (!secret) {
      throw new NotFoundException('Secret not found');
    }

    const decryptedContent = this.encryptionService.decrypt(
      secret.encryptedContent,
      password,
      secret.iv,
      secret.salt,
      secret.authTag,
    );

    secret.maxRetrievals -= 1;
    secret.retrievalCount += 1;

    if (secret.maxRetrievals === 0) {
      await this.secretsRepository.remove(secret);
    }

    await this.secretsRepository.save(secret);

    return {
      id: secret.id,
      content: decryptedContent,
      expirationDate: secret.expirationDate,
      maxRetrievals: secret.maxRetrievals,
      retrievalCount: secret.retrievalCount,
    };
  }
}
