import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Board } from '../modules/boards/entities/board.entity';
import { KanbanColumn as Column } from '../modules/columns/entities/column.entity';
import { Task } from '../modules/tasks/entities/task.entity';
import { TaskAssignment } from '../modules/tasks/entities/task-assignment.entity';
import { Comment } from '../modules/tasks/entities/comment.entity';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DATABASE_HOST'),
  port: configService.get('DATABASE_PORT'),
  username: configService.get('DATABASE_USERNAME'),
  password: configService.get('DATABASE_PASSWORD'),
  database: configService.get('DATABASE_NAME'),
  entities: [User, Board, Column, Task, TaskAssignment, Comment],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
});
