import { Module } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnsController } from './columns.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ColumnsService])],
  providers: [ColumnsService],
  controllers: [ColumnsController],
  exports: [ColumnsService],
})
export class ColumnsModule {}
