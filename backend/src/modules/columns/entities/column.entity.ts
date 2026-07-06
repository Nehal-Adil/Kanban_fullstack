import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Board } from '../../boards/entities/board.entity';

@Entity('columns')
export class KanbanColumn {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'integer', default: 0 })
  position!: number;

  // Many-to-One: Column belongs to one board
  @ManyToOne(() => Board, (board) => board.columns, { onDelete: 'CASCADE' })
  board!: Board;

  @Column('uuid')
  boardId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
