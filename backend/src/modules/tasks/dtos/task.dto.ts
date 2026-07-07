import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['todo', 'in_progress', 'done'])
  priority?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  position?: number;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class AssignTaskDto {
  @ApiProperty()
  @IsUUID()
  userId!: string;
}

export class TaskResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  priority?: string;

  @ApiProperty()
  dueDate?: Date;

  @ApiProperty()
  label?: string;

  @ApiProperty()
  assignments?: Array<{ id: string; email: string }>;

  @ApiProperty()
  comments?: number;

  @ApiProperty()
  createdAt!: Date;
}
