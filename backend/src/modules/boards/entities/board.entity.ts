import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { KanbanColumn } from '../../columns/entities/column.entity';

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  color?: string;

  // Many-to-One: Board belongs to one user (owner)
  @ManyToOne(() => User, (user) => user.ownedBoards, { eager: true })
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @Column('uuid')
  ownerId!: string;

  // Many-to-Many: Board can have many members
  @ManyToMany(() => User, (user) => user.boards)
  @JoinTable({
    name: 'board_members',
    joinColumn: { name: 'boardId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  members!: User[];

  // One board has many columns
  @OneToMany(() => KanbanColumn, (column) => column.board, { cascade: true })
  columns!: KanbanColumn[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
