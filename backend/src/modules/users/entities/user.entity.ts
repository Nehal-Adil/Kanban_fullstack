import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  firstName?: string;

  @Column({ type: 'varchar', length: 255 })
  lastName?: string;

  @Column({ type: 'text', select: false })
  password!: string;

  @Column({ type: 'varchar', length: 50, default: 'user' })
  role!: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
