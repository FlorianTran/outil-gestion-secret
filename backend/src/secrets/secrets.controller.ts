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
   * Crée un secret avec ou sans fichier
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
    // Vérification des champs obligatoires
    if (!body.content || !body.password) {
      throw new BadRequestException(
        'Le contenu et le mot de passe sont requis',
      );
    }

    // Valider maxRetrievals (si défini)
    if (body.maxRetrievals && body.maxRetrievals <= 0) {
      throw new BadRequestException(
        'Le nombre maximum de récupérations doit être un nombre positif',
      );
    }

    try {
      // Créer le secret
      const secret = await this.secretsService.createSecret(
        body.content,
        file,
        body.password,
        body.lifetime,
        body.maxRetrievals,
        body.createdBy,
      );
      return {
        message: 'Secret créé avec succès',
        id: secret.id,
        status: 200,
      };
    } catch (error) {
      throw new BadRequestException(
        'Erreur lors de la création du secret : ' + error.message,
      );
    }
  }

  /**
   * Récupère un secret par ID
   */
  @Post(':id')
  async getSecret(@Param('id') id: string, @Body() body: { password: string }) {
    if (!body.password) {
      throw new BadRequestException('Le mot de passe est requis');
    }

    try {
      const secret = await this.secretsService.retrieveSecret(
        id,
        body.password,
        false,
      );

      // Retourner un objet avec 'content' et 'file' (si présent)
      return {
        content: secret.content,
        file: secret.file
          ? {
              originalName: secret.file.originalName,
              data: secret.file.data, // Base64 si nécessaire
            }
          : null,
        message: 'Secret récupéré avec succès',
        status: 200,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(
        'Erreur lors de la récupération du secret : ' + error.message,
      );
    }
  }

  /**
   * Télécharge un fichier associé à un secret
   */
  @Post(':id/download')
  async downloadFile(
    @Param('id') id: string,
    @Body() body: { password: string },
    @Res() res: Response,
  ) {
    if (!body.password) {
      throw new BadRequestException('Le mot de passe est requis');
    }

    try {
      const secret = await this.secretsService.retrieveSecret(
        id,
        body.password,
        true,
      );

      if (!secret.file) {
        throw new NotFoundException('Aucun fichier associé à ce secret');
      }

      const decryptedFile = Buffer.from(secret.file.data, 'base64');

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${secret.file.originalName}"`,
      );
      res.setHeader('Content-Type', 'application/octet-stream');
      res.send(decryptedFile);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(
        'Erreur lors du téléchargement du fichier : ' + error.message,
      );
    }
  }

  /**
   * Retourne le nombre total de secrets
   */
  @Get('count')
  async getSecretCount() {
    try {
      const count = await this.secretsService.getSecretCount();
      return { count, status: 200 };
    } catch (error) {
      throw new BadRequestException(
        'Erreur lors de la récupération du nombre de secrets : ' +
          error.message,
      );
    }
  }

  /**
   * Retourne les secrets d'un utilisateur avec pagination et tri
   */
  @Get('user-secrets')
  async getUserSecrets(
    @Query('email') email: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
  ) {
    if (!email) {
      throw new BadRequestException("L'email est requis");
    }

    try {
      const secrets = await this.secretsService.getUserSecrets(
        email,
        page,
        limit,
        sortBy,
        order,
      );

      // Renvoie un objet contenant 'data' et 'total'
      return { data: secrets.data, total: secrets.total };
    } catch (error) {
      throw new BadRequestException(
        "Erreur lors de la récupération des secrets de l'utilisateur : " +
          error.message,
      );
    }
  }

  /**
   * Supprime un secret
   */
  @Post('delete/:id')
  async deleteSecret(
    @Param('id') id: string,
    @Body() body: { password: string },
  ): Promise<{ message: string }> {
    if (!body.password) {
      throw new BadRequestException('Le mot de passe est requis');
    }

    try {
      await this.secretsService.deleteSecret(id, body.password);
      return { message: 'Secret supprimé avec succès' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(
        'Erreur lors de la suppression du secret : ' + error.message,
      );
    }
  }
}
