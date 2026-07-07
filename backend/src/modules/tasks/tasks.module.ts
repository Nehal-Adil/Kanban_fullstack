import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { KanbanColumn as Column } from '../columns/entities/column.entity';
import { TaskAssignment } from './entities/task-assignment.entity';
import { User } from '../users/entities/user.entity';
import { Comment } from './entities/comment.entity';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Column, TaskAssignment, User, Comment]),
  ],
  providers: [TasksService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
