import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateColumnDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  position!: number;
}

export class UpdateColumnDto extends PartialType(CreateColumnDto) {}

export class ColumnResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  position!: number;

  @ApiProperty()
  boardId!: string;

  @ApiProperty()
  createdAt!: Date;
}
