import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'User email', example: 'john@example.com' })
  @IsEmail({}, { message: 'Please enter a valid email' })
  email!: string;

  @ApiProperty({ example: 'John', required: false, nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false, nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'SecurePass123' })
  @IsString()
  @MinLength(4)
  password!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePass123' })
  @IsString()
  password!: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  user!: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}
