import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from '../../users/entities/user.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  content!: string;

  @ManyToOne(() => Task, (task) => task.comments, { onDelete: 'CASCADE' })
  task!: Task;

  @Column('uuid')
  taskId!: string;

  @ManyToOne(() => User, (user) => user.comments, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author!: User;

  @Column('uuid')
  authorId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
