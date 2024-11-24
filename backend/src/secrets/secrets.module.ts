import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncryptionService } from './encryption.service';
import { SecretFile } from './secret-file.entity';
import { Secret } from './secret.entity';
import { SecretsController } from './secrets.controller';
import { SecretsService } from './secrets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Secret, SecretFile])], // Supprime EncryptionDetails
  controllers: [SecretsController],
  providers: [SecretsService, EncryptionService],
  exports: [SecretsService],
})
export class SecretsModule {}
