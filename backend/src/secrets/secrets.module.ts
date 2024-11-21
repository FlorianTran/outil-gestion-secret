import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecretsController } from './secrets.controller';
import { SecretsService } from './secrets.service';
import { EncryptionService } from './encryption.service';
import { Secret } from './secret.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Secret])],
  controllers: [SecretsController],
  providers: [SecretsService, EncryptionService],
  exports: [EncryptionService],
})
export class SecretsModule {}
