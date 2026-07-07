import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { KanbanColumn as Column } from '../columns/entities/column.entity';
import { User } from '../users/entities/user.entity';
import { TaskAssignment } from './entities/task-assignment.entity';
import { CreateTaskDto, TaskResponseDto, UpdateTaskDto } from './dtos/task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Column)
    private columnRepository: Repository<Column>,
    @InjectRepository(TaskAssignment)
    private assignmentRepository: Repository<TaskAssignment>,
    @InjectRepository(User)
    private userRespository: Repository<User>,
  ) {}

  // create task in column
  async create(
    columnId: string,
    createTaskDto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    const column = await this.columnRepository.findOne({
      where: { id: columnId },
    });
    if (!column) {
      throw new NotFoundException('Column not found');
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      columnId,
    });

    const savedTask = await this.taskRepository.save(task);

    // Map it to TaskResponseDto
    return {
      ...savedTask,
      assignments: [],
      // Since it's a brand new task, assignments will be empty and comments will be 0
      comments: 0,
    };
  }

  // get all tasks in column with assignments
  async findByColumnId(columnId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { columnId },
      relations: { assignments: { user: true }, comments: true },
      order: { position: 'ASC' },
    });
  }

  // get task with relations
  async findById(id: string): Promise<TaskResponseDto> {
    const task = await this.findTaskEntityById(id);

    return this.mapToDto(task);
  }

  // update task
  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    const task = await this.findTaskEntityById(id);

    Object.assign(task, updateTaskDto);
    await this.taskRepository.save(task);

    return this.mapToDto(task);
  }

  // delete task
  async delete(id: string): Promise<void> {
    const task = await this.findTaskEntityById(id);
    await this.taskRepository.remove(task);
  }

  // move task to different column (change columnId and position)
  async moveTask(
    taskId: string,
    newColumnId: string,
    position: number,
  ): Promise<TaskResponseDto> {
    const task = await this.findTaskEntityById(taskId);
    const column = await this.columnRepository.findOne({
      where: { id: newColumnId },
    });
    if (!column) {
      throw new NotFoundException('Target column not found');
    }

    task.columnId = newColumnId;
    task.position = position;

    await this.taskRepository.save(task);

    return this.mapToDto(task);
  }

  // assign user (create TaskAssignment)
  async assignUser(taskId: string, userId: string): Promise<TaskResponseDto> {
    const task = await this.findById(taskId);
    const user = await this.userRespository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingAssignment = await this.assignmentRepository.findOne({
      where: { taskId, userId },
    });
    if (!existingAssignment) {
      const assignment = this.assignmentRepository.create({ taskId, userId });
      await this.assignmentRepository.save(assignment);
    }

    return this.findById(taskId);
  }

  // remove assignment
  async unassignUser(taskId: string, userId: string): Promise<TaskResponseDto> {
    const assignment = await this.assignmentRepository.findOne({
      where: { taskId, userId },
    });
    if (assignment) {
      await this.assignmentRepository.remove(assignment);
    }

    return this.findById(taskId);
  }

  private async findTaskEntityById(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: {
        comments: true,
        assignments: {
          user: true,
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  private mapToDto(task: Task): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      label: task.label,
      createdAt: task.createdAt,
      assignments:
        task.assignments?.map((assignment) => ({
          id: assignment.user?.id,
          email: assignment.user?.email,
        })) || [],
      comments: task.comments ? task.comments.length : 0,
    };
  }
}
