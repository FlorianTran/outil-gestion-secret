import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Secret {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  encryptedContent: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  expirationDate: Date;

  @Column({ default: 1 })
  maxRetrievals: number;

  @Column({ default: 0 })
  retrievalCount: number;
}
