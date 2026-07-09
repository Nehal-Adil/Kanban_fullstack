import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ColumnResponseDto } from '../../columns/dtos/column.dto';

export class CreateBoardDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  color?: string;
}

export class UpdateBoardDto extends PartialType(CreateBoardDto) {}

export class AddMemberDto {
  @ApiProperty()
  @IsUUID()
  userId!: string;
}

export class BoardResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  color?: string;

  @ApiProperty()
  owner!: { id: string; email: string; firstName: string; lastName: string };

  @ApiProperty()
  members?: Array<{ id: string; email: string }>;

  @ApiProperty({ type: [ColumnResponseDto], required: false })
  columns?: ColumnResponseDto[];

  @ApiProperty()
  createdAt!: Date;
}
