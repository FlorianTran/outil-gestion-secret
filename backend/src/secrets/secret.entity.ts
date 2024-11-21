import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Secret {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  encryptedContent: string; // Contient le contenu chiffré

  @Column()
  salt: string; // Sel utilisé pour dériver la clé à partir du mot de passe

  @Column()
  iv: string; // Vecteur d'initialisation utilisé pour AES

  @Column()
  authTag: string; // Tag d'authentification pour AES-GCM

  @Column({ nullable: true })
  expirationDate: Date; // Date d'expiration du secret (facultatif)

  @Column({ default: 1 })
  maxRetrievals: number; // Nombre maximum de récupérations autorisées

  @Column({ default: 0 })
  retrievalCount: number; // Nombre de fois que le secret a été récupéré
}
