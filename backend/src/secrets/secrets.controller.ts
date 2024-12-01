import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { SecretsService } from './secrets.service';

@Controller('secrets')
export class SecretsController {
  constructor(private readonly secretsService: SecretsService) {}

  /**
   * Endpoint pour créer un secret avec ou sans fichier
   */
  @Post('create')
  @UseInterceptors(FileInterceptor('file'))
  async createSecret(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body()
    body: {
      content: string;
      password: string;
      lifetime?: number;
      maxRetrievals?: number;
      createdBy?: string;
    },
  ) {
    if (!body.content || !body.password) {
      throw new BadRequestException('Content and password are required');
    }

    this.secretsService.validateMaxRetrievals(body.maxRetrievals);

    const secret = await this.secretsService.createSecret(
      body.content,
      file,
      body.password,
      body.lifetime,
      body.maxRetrievals,
      body.createdBy,
    );

    return { message: 'Secret created successfully', id: secret.id };
  }

  /**
   * Endpoint pour récupérer un secret par son ID
   */
  @Post(':id')
  async getSecret(@Param('id') id: string, @Body() body: { password: string }) {
    // Validation des entrées requises
    if (!body.password) {
      throw new BadRequestException('Password is required');
    }

    // Récupération et déchiffrement du secret via le service
    const secret = await this.secretsService.retrieveSecret(
      id,
      body.password,
      false,
    );

    return secret;
  }

  /**
   * Endpoint pour télécharger un fichier associé à un secret
   */
  @Post(':id/download')
  async downloadFile(
    @Param('id') id: string,
    @Body() body: { password: string },
    @Res() res: Response,
  ) {
    if (!body.password) {
      throw new BadRequestException('Password is required');
    }

    const secret = await this.secretsService.retrieveSecret(
      id,
      body.password,
      true,
    );

    if (!secret.file) {
      throw new NotFoundException('No file associated with this secret');
    }

    // Déchiffrement du fichier
    const decryptedFile = Buffer.from(secret.file.data, 'base64');

    // En-têtes pour téléchargement avec le nom original du fichier
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${secret.file.originalName}"`,
    );
    res.setHeader('Content-Type', 'application/octet-stream');

    return res.send(decryptedFile);
  }

  @Get('count')
  async getSecretCount() {
    const count = await this.secretsService.getSecretCount();

    return { count };
  }

  @Get('user-secrets')
  async getUserSecrets(
    @Query('email') email: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
  ) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    return this.secretsService.getUserSecrets(
      email,
      page,
      limit,
      sortBy,
      order,
    );
  }
}
