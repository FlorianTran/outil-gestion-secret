import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EncryptionDetails } from './encryption-details.entity';
import { SecretFile } from './secret-file.entity';

@Entity()
export class Secret {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  encryptedContent: string; // Texte chiffré

  @Column(() => EncryptionDetails) // Détails de chiffrement pour le texte
  encryptionDetails: EncryptionDetails;

  @OneToOne(() => SecretFile, { cascade: true, eager: true }) // Relation avec SecretFile
  @JoinColumn()
  file: SecretFile | null;

  @Column({ nullable: true })
  expirationDate: Date;

  @Column({ nullable: true })
  maxRetrievals: number;

  @Column({ default: 0 })
  retrievalCount: number;
}
