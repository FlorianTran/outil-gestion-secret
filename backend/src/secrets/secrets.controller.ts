import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from './encryption.service';
import { Secret } from './secret.entity';
import { SecretsService } from './secrets.service';

@Controller('secrets')
export class SecretsController {
  constructor(
    private readonly encryptionService: EncryptionService,
    @InjectRepository(Secret) private secretsRepository: Repository<Secret>,
    private readonly secretsService: SecretsService,
  ) {}

  @Post()
  async createSecret(
    @Body()
    body: {
      content: string;
      password: string;
      expirationDate?: Date;
      maxRetrievals?: number;
    },
  ) {
    const { encrypted, iv, salt, authTag } = this.encryptionService.encrypt(
      body.content,
      body.password,
    );

    const secret = this.secretsRepository.create({
      encryptedContent: encrypted,
      iv,
      salt,
      authTag,
      expirationDate: body.expirationDate || null,
      maxRetrievals: body.maxRetrievals,
    });

    await this.secretsRepository.save(secret);
    return {
      message: 'Creating secret',
      id: secret.id,
    };
  }

  @Get(':id')
  async getSecret(@Param('id') id: string, @Body() body: { password: string }) {
    return this.secretsService.processSecrets(id, body.password);
  }
}
