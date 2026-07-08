import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, User])],
  providers: [BoardsService],
  controllers: [BoardsController],
  exports: [BoardsService, TypeOrmModule],
})
export class BoardsModule {}
