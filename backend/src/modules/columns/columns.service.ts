import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { KanbanColumn as Column } from './entities/column.entity';
import { Board } from '../boards/entities/board.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ColumnResponseDto,
  CreateColumnDto,
  UpdateColumnDto,
} from './dtos/column.dto';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(Column)
    private columnRepository: Repository<Column>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  // create column in board
  async create(
    boardId: string,
    createColumnDto: CreateColumnDto,
  ): Promise<Column> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const column = this.columnRepository.create({
      ...createColumnDto,
      boardId,
    });

    return this.columnRepository.save(column);
  }

  // get all columns in board (ordered by position)
  async findByBoardId(boardId: string): Promise<Column[]> {
    return this.columnRepository.find({
      where: { boardId },
      order: { position: 'ASC' },
      // relations: {tasks: true}
    });
  }

  // get column with tasks
  async findById(id: string): Promise<Column> {
    const column = await this.columnRepository.findOne({
      where: { id },
      // relations: { tasks: true }
    });
    if (!column) {
      throw new NotFoundException('Column not found');
    }

    return column;
  }

  // update column
  async update(id: string, updateColumnDto: UpdateColumnDto): Promise<Column> {
    const column = await this.findById(id);
    Object.assign(column, updateColumnDto);
    return this.columnRepository.save(column);
  }

  // delete column (cascade deletes tasks)
  async delete(id: string): Promise<void> {
    const column = await this.findById(id);
    await this.columnRepository.remove(column);
  }
}
