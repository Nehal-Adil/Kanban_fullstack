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
import { TasksService } from './tasks.service';
import {
  AssignTaskDto,
  CreateTaskDto,
  TaskResponseDto,
  UpdateTaskDto,
} from './dtos/task.dto';

@ApiTags('Tasks')
@Controller('columns/:columnId/tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('Authorization')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create task in column' })
  async create(
    @Param('columnId') columnId: string,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    return this.tasksService.create(columnId, createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks in column' })
  async getByColumnId(@Param('columnId') columnId: string) {
    return this.tasksService.findByColumnId(columnId);
  }

  @Get(':taskId')
  @ApiOperation({ summary: 'Get task by ID' })
  async findById(@Param('taskId') taskId: string): Promise<TaskResponseDto> {
    return this.tasksService.findById(taskId);
  }

  @Put(':taskId')
  @ApiOperation({ summary: 'Update task' })
  async update(
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    return this.tasksService.update(taskId, updateTaskDto);
  }

  @Delete(':taskId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete task' })
  async delete(@Param('taskId') taskId: string): Promise<void> {
    return this.tasksService.delete(taskId);
  }

  @Put(':taskId/move')
  @ApiOperation({ summary: 'Move task to different column' })
  async moveTask(
    @Param('taskId') taskId: string,
    @Body()
    { newColumnId, position }: { newColumnId: string; position: number },
  ): Promise<TaskResponseDto> {
    return this.tasksService.moveTask(taskId, newColumnId, position);
  }

  @Post(':taskId/assign')
  @ApiOperation({ summary: 'Assign user to task' })
  async assignUser(
    @Param('taskId') taskId: string,
    @Body() assignTaskDto: AssignTaskDto,
  ): Promise<TaskResponseDto> {
    return this.tasksService.assignUser(taskId, assignTaskDto.userId);
  }

  @Delete(':taskId/assign/:userId')
  @ApiOperation({ summary: 'Unassign user from task' })
  async unassignUser(
    @Param('taskId') taskId: string,
    @Param('userId') userId: string,
  ): Promise<TaskResponseDto> {
    return this.tasksService.unassignUser(taskId, userId);
  }
}
