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

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastName?: string;

  @Column({ type: 'text', select: false })
  password!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ type: 'boolean', default: false })
  isEmailVerified!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

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
