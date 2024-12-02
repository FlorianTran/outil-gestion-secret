import {
  Controller,
  NotFoundException,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AccessService } from './access.service';
import { SecretsService } from 'src/secrets/secrets.service';

@Controller('access')
export class AccessController {
  constructor(
    private readonly accessService: AccessService,
    private readonly secretsService: SecretsService,
  ) {}

  /**
   * Endpoint pour notifier l'accès à un secret
   */
  @Post('notify/:id')
  async notifyAccess(@Param('id') id: string, @Req() req: Request) {
    const secret = await this.secretsService.findSecretById(id);
    if (!secret) {
      throw new NotFoundException('Secret not found');
    }

    // Récupérer et nettoyer l'adresse IP client
    const rawIp =
      req.headers['x-forwarded-for']?.toString() ||
      req.socket.remoteAddress ||
      '127.0.0.1';
    const clientIp = rawIp.replace('::ffff:', ''); // Nettoyage du préfixe IPv6

    // Récupérer les informations géographiques
    const geoInfo = (await this.accessService.getGeoInfo(clientIp)) || {
      city: 'Unknown',
      country: 'Unknown',
    };

    const userAgent = req.headers['user-agent'] || 'Unknown';

    console.log(`Access notification:
    IP: ${clientIp}
    GeoInfo: ${geoInfo.city}, ${geoInfo.country}
    UserAgent: ${userAgent}`);

    // Envoie de l'e-mail si le secret a un email associé
    if (secret.createdBy) {
      await this.accessService.sendEmailNotification({
        email: secret.createdBy,
        clientIp,
        userAgent,
        geoInfo,
      });
    } else {
      console.log(
        'No email associated with this secret. Notification skipped.',
      );
    }

    return {
      message: 'Notification sent',
      ip: clientIp,
      geoInfo,
      userAgent,
    };
  }
}
