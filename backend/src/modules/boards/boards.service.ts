import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Board } from './entities/board.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BoardResponseDto,
  CreateBoardDto,
  UpdateBoardDto,
} from './dtos/board.dto';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // create board owned by current user
  async create(
    owner: User,
    createBoardDto: CreateBoardDto,
  ): Promise<BoardResponseDto> {
    const newBoard = this.boardRepository.create({
      ...createBoardDto,
      owner,
    });

    const savedBoard = await this.boardRepository.save(newBoard);

    return {
      id: savedBoard.id,
      title: savedBoard.title,
      description: savedBoard.description,
      color: savedBoard.color,
      createdAt: savedBoard.createdAt,
      owner: {
        id: owner.id,
        email: owner.email,
        firstName: owner.firstName || '',
        lastName: owner.lastName || '',
      },
      members: [],
    };
  }

  // get all boards user owns or is member of
  async findUserBoards(userId: string) {
    return this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.owner', 'owner')
      .leftJoinAndSelect('board.members', 'members')
      .where('board.ownerId = :userId OR members.id = :userId', { userId })
      .getMany();
  }

  // get board with relations
  async findById(id: string): Promise<BoardResponseDto> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        members: true,
        columns: { tasks: true },
      },
    });
    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return {
      id: board.id,
      title: board.title,
      description: board.description,
      color: board.color,
      createdAt: board.createdAt,
      owner: {
        id: board.owner.id,
        email: board.owner.email,
        firstName: board.owner.firstName || '',
        lastName: board.owner.lastName || '',
      },
      members: board.members.map((m) => ({
        id: m.id,
        email: m.email,
      })),
      columns: (board.columns ?? [])
        .sort((a, b) => a.position - b.position)
        .map((col) => ({
          ...col,
          tasks: (col.tasks ?? []).sort((a, b) => a.position - b.position),
        })),
    };
  }

  // only owner can update
  async update(
    id: string,
    userId: string,
    updateBoardDto: UpdateBoardDto,
  ): Promise<BoardResponseDto> {
    const board = await this.findById(id);

    if (board.owner.id !== userId) {
      throw new ForbiddenException('Only board owner can update');
    }

    Object.assign(board, updateBoardDto);
    return this.boardRepository.save(board);
  }

  // only owner can delete
  async delete(id: string, userId: string): Promise<void> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        members: true,
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.owner.id !== userId) {
      throw new ForbiddenException('Only board owner can delete');
    }

    await this.boardRepository.remove(board);
  }

  // add user to board (Many-to-Many)
  async addMember(
    boardId: string,
    userId: string,
    currentUserId: string,
  ): Promise<BoardResponseDto> {
    const board = await this.findById(boardId);

    if (board.owner.id !== currentUserId) {
      throw new ForbiddenException('Only board owner can add members');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!board.members) {
      board.members = [];
    }

    if (!board.members.find((m) => m.id === userId)) {
      board.members.push(user);
      await this.boardRepository.save(board);
    }

    return board;
  }

  // remove user from board
  async removeMember(
    boardId: string,
    userId: string,
    currentUserId: string,
  ): Promise<Board> {
    const board = await this.findById(boardId);

    if (board.owner.id !== currentUserId) {
      throw new ForbiddenException('Only board owner can remove members');
    }

    board.members = board.members?.filter((m) => m.id !== userId);
    return this.boardRepository.save(board);
  }
}
