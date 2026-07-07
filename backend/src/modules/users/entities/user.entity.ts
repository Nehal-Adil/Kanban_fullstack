import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Board } from '../../boards/entities/board.entity';
import { TaskAssignment } from '../../tasks/entities/task-assignment.entity';
import { Comment } from '../../tasks/entities/comment.entity';

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

  // One user has many boards (owner)
  @OneToMany(() => Board, (board) => board.owner, { cascade: true })
  ownedBoards!: Board[];

  // Many-to-Many: User can be member of many boards
  @ManyToMany(() => Board, (board) => board.members)
  boards!: Board[];

  // One user can be assigned to many tasks
  @OneToMany(() => TaskAssignment, (assignment) => assignment.user, {
    cascade: true,
  })
  taskAssignments!: TaskAssignment[];

  // One user can create many comments
  @OneToMany(() => Comment, (comment) => comment.author, { cascade: true })
  comments!: Comment[];
}
