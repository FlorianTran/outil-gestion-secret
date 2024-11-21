import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from './encryption.service';
import { Secret } from './secret.entity';
import { SecretsService } from './secrets.service';

@Controller('secrets')
export class SecretsController {
  constructor(
    private readonly encryptionService: EncryptionService,
    @InjectRepository(Secret)
    private readonly secretsRepository: Repository<Secret>,
    private readonly secretsService: SecretsService,
  ) {}

  @Post()
  async createSecret(
    @Body()
    body: {
      content: string;
      password: string;
      lifetime?: number;
      maxRetrievals?: number;
    },
  ) {
    if (!body.content || !body.password) {
      throw new BadRequestException('Content and password are required');
    }

    const { encrypted, iv, salt, authTag } = this.encryptionService.encrypt(
      body.content,
      body.password,
    );

    const expirationDate = this.secretsService.handleLifetime(body.lifetime);
    const maxRetrievals = body.maxRetrievals ?? null;

    const secret = this.secretsRepository.create({
      encryptedContent: encrypted,
      iv,
      salt,
      authTag,
      expirationDate,
      maxRetrievals,
    });

    await this.secretsRepository.save(secret);

    return { message: 'Secret created successfully', id: secret.id };
  }

  @Get(':id')
  async getSecret(@Param('id') id: string, @Body() body: { password: string }) {
    return await this.secretsService.processSecrets(id, body.password);
  }
}
