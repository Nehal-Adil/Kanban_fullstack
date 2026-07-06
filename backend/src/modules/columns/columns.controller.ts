import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ColumnsService } from './columns.service';
import {
  ColumnResponseDto,
  CreateColumnDto,
  UpdateColumnDto,
} from './dtos/column.dto';

@ApiTags('Columns')
@Controller('boards/:boardId/columns')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('Authorization')
export class ColumnsController {
  constructor(private columnService: ColumnsService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create column in board' })
  async create(
    @Param('boardId') boardId: string,
    @Body() createColumnDto: CreateColumnDto,
  ): Promise<ColumnResponseDto> {
    return this.columnService.create(boardId, createColumnDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all columns in board' })
  async getByBoardId(@Param('boardId') boardId: string) {
    return this.columnService.findByBoardId(boardId);
  }

  @Get(':columnId')
  @ApiOperation({ summary: 'Get column by ID' })
  async findById(
    @Param('columnId') columnId: string,
  ): Promise<ColumnResponseDto> {
    return this.columnService.findById(columnId);
  }

  @Put(':columnId')
  @ApiOperation({ summary: 'Update column' })
  async update(
    @Param('columnId') columnId: string,
    updateColumnDto: UpdateColumnDto,
  ): Promise<UpdateColumnDto> {
    return this.columnService.update(columnId, updateColumnDto);
  }

  @Delete(':columnId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete column' })
  async delete(@Param('columnId') columnId: string): Promise<void> {
    return this.columnService.delete(columnId);
  }
}
