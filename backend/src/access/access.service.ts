import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AccessService {
  /**
   * Envoie une notification par e-mail
   */
  public async sendEmailNotification({
    email,
    clientIp,
    userAgent,
    geoInfo = { city: 'Unknown', country: 'Unknown' },
  }: {
    email: string;
    clientIp: string;
    userAgent: string;
    geoInfo?: { city: string; country: string };
  }) {
    // Configurer le transporteur SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10) || 2525,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Construire le contenu de l'e-mail
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Notification d’accès à un secret',
      html: `
        <h1>Notification d'accès</h1>
        <p><strong>IP :</strong> ${clientIp}</p>
        <p><strong>Localisation :</strong> ${geoInfo.city}, ${geoInfo.country}</p>
        <p><strong>User Agent :</strong> ${userAgent}</p>
      `,
    };

    // Envoyer l'e-mail
    await transporter.sendMail(mailOptions);
    console.log(`Notification envoyée à : ${email}`);
  }

  /**
   * Récupère les informations géographiques pour une IP donnée
   */
  async getGeoInfo(
    ip: string,
  ): Promise<{ city: string; country: string } | null> {
    try {
      const response = await axios.get(`http://ip-api.com/json/${ip}`);
      return response.data || null;
    } catch {
      return null;
    }
  }
}
