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
import { BoardsService } from './boards.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import {
  AddMemberDto,
  BoardResponseDto,
  CreateBoardDto,
  UpdateBoardDto,
} from './dtos/board.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('Boards')
@Controller('boards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('Authorization')
export class BoardsController {
  constructor(private boardService: BoardsService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create new board' })
  async create(
    @CurrentUser() user: User,
    @Body() createBoardDto: CreateBoardDto,
  ): Promise<BoardResponseDto> {
    return this.boardService.create(user, createBoardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all boards for current user' })
  async getMyBoards(@CurrentUser() user: User) {
    return this.boardService.findUserBoards(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get board by ID' })
  async findById(@Param('id') id: string): Promise<BoardResponseDto> {
    return this.boardService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update board' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateBoardDto: UpdateBoardDto,
  ): Promise<BoardResponseDto> {
    return this.boardService.update(id, user.id, updateBoardDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete board' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.boardService.delete(id, user.id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to board' })
  async addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
    @CurrentUser() user: User,
  ) {
    return this.boardService.addMember(id, addMemberDto.userId, user.id);
  }

  @Delete(':id/members/:memberId')
  @ApiOperation({ summary: 'Remove member from board' })
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: User,
  ) {
    return this.boardService.removeMember(id, memberId, user.id);
  }
}
