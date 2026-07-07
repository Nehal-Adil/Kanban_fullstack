import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { KanbanColumn } from '../../columns/entities/column.entity';
import { TaskAssignment } from './task-assignment.entity';
import { Comment } from './comment.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'integer', default: 0 })
  position!: number;

  @Column({
    type: 'enum',
    enum: ['todo', 'in_progress', 'done'],
    default: 'todo',
  })
  priority!: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  label?: string;

  // Many-to-One: Task belongs to one column
  @ManyToOne(() => KanbanColumn, (column) => column.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'columnId' })
  column!: KanbanColumn;

  @Column('uuid')
  columnId!: string;

  // One task can have many assignments (Many-to-Many with User)
  @OneToMany(() => TaskAssignment, (assignment) => assignment.task, {
    cascade: true,
  })
  assignments!: TaskAssignment[];

  // One task can have many comments
  @OneToMany(() => Comment, (comment) => comment.task, { cascade: true })
  comments!: Comment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
