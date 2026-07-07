import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from '../../users/entities/user.entity';

@Entity('task_assignments')
export class TaskAssignment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Many-to-One: Assignment belongs to one task
  @ManyToOne(() => Task, (task) => task.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task!: Task;

  @JoinColumn({ name: 'taskId' })
  taskId!: string;

  // Many-to-One: Assignment belongs to one user
  @ManyToOne(() => User, (user) => user.taskAssignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @JoinColumn({ name: 'userId' })
  userId!: string;

  @CreateDateColumn()
  assignedAt!: Date;
}
