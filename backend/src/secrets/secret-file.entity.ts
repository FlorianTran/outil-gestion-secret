import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EncryptionDetails } from './encryption-details.entity';

@Entity()
export class SecretFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bytea' }) // Utilise 'bytea' pour stocker des fichiers binaires en base de données
  data: Buffer;

  @Column()
  originalFileName: string;

  @Column(() => EncryptionDetails) // Détails de chiffrement pour le fichier
  encryptionDetails: EncryptionDetails;
}
