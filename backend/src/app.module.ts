import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { AppController } from './app.controller';
import { EncryptionService } from './secrets/encryption.service';
import { SecretsModule } from './secrets/secrets.module';
import { AccessController } from './access/access.controller';
import { AccessModule } from './access/access.module';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Inclut toutes les entités
      synchronize: true, // changer en prod par false et remplacer par des migrations
    }),
    SecretsModule,
    AccessModule,
  ],
  controllers: [AppController, AccessController],
  providers: [EncryptionService],
})
export class AppModule {}
