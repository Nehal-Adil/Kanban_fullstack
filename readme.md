# NestJS Kanban Project Management Tool - Backend Roadmap 🗂️

## Tech Stack (Latest Versions - June 2026)

**Framework:** NestJS 10.x  
**ORM:** TypeORM 0.3.x  
**Database:** PostgreSQL 15+  
**Language:** TypeScript 5.x  
**Authentication:** JWT + bcryptjs  
**API Docs:** Swagger/OpenAPI  
**Runtime:** Node.js 20+

---

## Phase 0: Project Setup & Configuration

> ✅ Goal: Initialize NestJS project with TypeORM and basic structure.

### Create Project

```bash
npm i -g @nestjs/cli
nest new kanban-backend
cd kanban-backend
```

### Install Dependencies

```bash
npm install @nestjs/common @nestjs/platform-express @nestjs/core
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcryptjs class-validator class-transformer
npm install @nestjs/config dotenv
npm install @nestjs/swagger swagger-ui-express
npm install uuid
```

### Dev Dependencies

```bash
npm install -D @types/express @types/node typescript
npm install -D @types/bcryptjs @types/passport-jwt
npm install -D eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D jest @types/jest ts-jest @nestjs/testing
```

### Package.json Scripts

```json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "build": "nest build",
    "migration:generate": "npm run build && npx typeorm migration:generate",
    "migration:run": "npm run build && npx typeorm migration:run",
    "migration:revert": "npm run build && npx typeorm migration:revert",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  }
}
```

### Folder Structure

```
/src
  /config
    database.config.ts
    env.config.ts
  /database
    /migrations
  /modules
    /auth
      /controllers
      /services
      /guards
      /strategies
      /dtos
      auth.module.ts
    /users
      /controllers
      /services
      /dtos
      /entities
      users.module.ts
    /boards
      /controllers
      /services
      /dtos
      /entities
      boards.module.ts
    /columns
      /controllers
      /services
      /dtos
      /entities
      columns.module.ts
    /tasks
      /controllers
      /services
      /dtos
      /entities
      tasks.module.ts
  /common
    /decorators
    /guards
    /filters
  app.module.ts
  main.ts

.env
.env.example
.gitignore
.dockerignore
Dockerfile
docker-compose.yml
```

### Environment Variables (.env)

```env
NODE_ENV=development
PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=kanban_db
DATABASE_URL=postgresql://postgres:password@localhost:5432/kanban_db

JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRATION=86400

SWAGGER_TITLE=Kanban API
SWAGGER_DESCRIPTION=Project Management API
SWAGGER_VERSION=1.0.0

API_URL=http://localhost:3000
API_PREFIX=api/v1
```

### TypeORM Configuration (config/database.config.ts)

```typescript
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { User } from "../modules/users/entities/user.entity";
import { Board } from "../modules/boards/entities/board.entity";
import { Column } from "../modules/columns/entities/column.entity";
import { Task } from "../modules/tasks/entities/task.entity";
import { TaskAssignment } from "../modules/tasks/entities/task-assignment.entity";
import { Comment } from "../modules/tasks/entities/comment.entity";

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: "postgres",
  host: configService.get("DATABASE_HOST"),
  port: configService.get("DATABASE_PORT"),
  username: configService.get("DATABASE_USER"),
  password: configService.get("DATABASE_PASSWORD"),
  database: configService.get("DATABASE_NAME"),
  entities: [User, Board, Column, Task, TaskAssignment, Comment],
  migrations: ["dist/database/migrations/*.js"],
  synchronize: configService.get("NODE_ENV") === "development",
  logging: configService.get("NODE_ENV") === "development",
});
```

### App Module (app.module.ts)

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { typeOrmConfig } from "./config/database.config";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { BoardsModule } from "./modules/boards/boards.module";
import { ColumnsModule } from "./modules/columns/columns.module";
import { TasksModule } from "./modules/tasks/tasks.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    AuthModule,
    UsersModule,
    BoardsModule,
    ColumnsModule,
    TasksModule,
  ],
})
export class AppModule {}
```

### Main Entry (main.ts)

```typescript
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: "api/v",
  });

  app.setGlobalPrefix("api");

  // Swagger
  const config = new DocumentBuilder()
    .setTitle(configService.get("SWAGGER_TITLE"))
    .setDescription(configService.get("SWAGGER_DESCRIPTION"))
    .setVersion(configService.get("SWAGGER_VERSION"))
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "Authorization",
    )
    .addTag("Auth")
    .addTag("Users")
    .addTag("Boards")
    .addTag("Columns")
    .addTag("Tasks")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  app.enableCors({
    origin: "*",
    credentials: true,
  });

  const port = configService.get("PORT") || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Docs available at http://localhost:${port}/docs`);
}

bootstrap();
```

### Docker Setup (docker-compose.yml)

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: kanban_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USER: postgres
      DATABASE_PASSWORD: password
      DATABASE_NAME: kanban_db
      NODE_ENV: development

volumes:
  postgres_data:
```

---

## Phase 1: Database Schema & Entities

> ✅ Goal: Design database with One-to-Many and Many-to-Many relationships.

### User Entity (modules/users/entities/user.entity.ts)

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  Unique,
} from "typeorm";
import { Board } from "../../boards/entities/board.entity";
import { Task } from "../../tasks/entities/task.entity";
import { TaskAssignment } from "../../tasks/entities/task-assignment.entity";
import { Comment } from "../../tasks/entities/comment.entity";

@Entity("users")
@Unique(["email"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  email: string;

  @Column({ type: "varchar", length: 255 })
  firstName: string;

  @Column({ type: "varchar", length: 255 })
  lastName: string;

  @Column({ type: "text", select: false })
  password: string;

  @Column({ type: "varchar", length: 50, default: "user" })
  role: string;

  @Column({ type: "boolean", default: false })
  isEmailVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // One user has many boards (owner)
  @OneToMany(() => Board, (board) => board.owner, { cascade: true })
  ownedBoards: Board[];

  // Many-to-Many: User can be member of many boards
  @ManyToMany(() => Board, (board) => board.members)
  boards: Board[];

  // One user can be assigned to many tasks
  @OneToMany(() => TaskAssignment, (assignment) => assignment.user, {
    cascade: true,
  })
  taskAssignments: TaskAssignment[];

  // One user can create many comments
  @OneToMany(() => Comment, (comment) => comment.author, { cascade: true })
  comments: Comment[];
}
```

### Board Entity (modules/boards/entities/board.entity.ts)

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Column as KanbanColumn } from "../../columns/entities/column.entity";

@Entity("boards")
export class Board {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  color: string;

  // Many-to-One: Board belongs to one user (owner)
  @ManyToOne(() => User, (user) => user.ownedBoards, { eager: true })
  @JoinColumn({ name: "ownerId" })
  owner: User;

  @Column("uuid")
  ownerId: string;

  // Many-to-Many: Board can have many members
  @ManyToMany(() => User, (user) => user.boards)
  @JoinTable({
    name: "board_members",
    joinColumn: { name: "boardId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "userId", referencedColumnName: "id" },
  })
  members: User[];

  // One board has many columns
  @OneToMany(() => KanbanColumn, (column) => column.board, { cascade: true })
  columns: KanbanColumn[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Column Entity (modules/columns/entities/column.entity.ts)

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Board } from "../../boards/entities/board.entity";
import { Task } from "../../tasks/entities/task.entity";

@Entity("columns")
export class Column {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "integer", default: 0 })
  position: number;

  // Many-to-One: Column belongs to one board
  @ManyToOne(() => Board, (board) => board.columns, { onDelete: "CASCADE" })
  @JoinColumn({ name: "boardId" })
  board: Board;

  @Column("uuid")
  boardId: string;

  // One column has many tasks
  @OneToMany(() => Task, (task) => task.column, { cascade: true })
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Task Entity (modules/tasks/entities/task.entity.ts)

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Column as KanbanColumn } from "../../columns/entities/column.entity";
import { TaskAssignment } from "./task-assignment.entity";
import { Comment } from "./comment.entity";

@Entity("tasks")
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "integer", default: 0 })
  position: number;

  @Column({
    type: "enum",
    enum: ["todo", "in_progress", "done"],
    default: "todo",
  })
  priority: string;

  @Column({ type: "timestamp", nullable: true })
  dueDate: Date;

  @Column({ type: "varchar", length: 20, nullable: true })
  label: string;

  // Many-to-One: Task belongs to one column
  @ManyToOne(() => KanbanColumn, (column) => column.tasks, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "columnId" })
  column: KanbanColumn;

  @Column("uuid")
  columnId: string;

  // One task can have many assignments (Many-to-Many with User)
  @OneToMany(() => TaskAssignment, (assignment) => assignment.task, {
    cascade: true,
  })
  assignments: TaskAssignment[];

  // One task can have many comments
  @OneToMany(() => Comment, (comment) => comment.task, { cascade: true })
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### TaskAssignment Entity (modules/tasks/entities/task-assignment.entity.ts)

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Task } from "./task.entity";
import { User } from "../../users/entities/user.entity";

@Entity("task_assignments")
export class TaskAssignment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Many-to-One: Assignment belongs to one task
  @ManyToOne(() => Task, (task) => task.assignments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "taskId" })
  task: Task;

  @JoinColumn({ name: "taskId" })
  taskId: string;

  // Many-to-One: Assignment belongs to one user
  @ManyToOne(() => User, (user) => user.taskAssignments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user: User;

  @JoinColumn({ name: "userId" })
  userId: string;

  @CreateDateColumn()
  assignedAt: Date;
}
```

### Comment Entity (modules/tasks/entities/comment.entity.ts)

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Task } from "./task.entity";
import { User } from "../../users/entities/user.entity";

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  content: string;

  @ManyToOne(() => Task, (task) => task.comments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "taskId" })
  task: Task;

  @Column("uuid")
  taskId: string;

  @ManyToOne(() => User, (user) => user.comments, { eager: true })
  @JoinColumn({ name: "authorId" })
  author: User;

  @Column("uuid")
  authorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Generate & Run Migrations

```bash
npm run migration:generate -- -n Init
npm run migration:run
```

---

## Phase 2: Authentication System

> ✅ Goal: JWT-based auth with role-based access control.

### Auth DTOs (modules/auth/dtos/auth.dto.ts)

```typescript
import { IsEmail, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "john@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "John" })
  @IsString()
  firstName: string;

  @ApiProperty({ example: "Doe" })
  @IsString()
  lastName: string;

  @ApiProperty({ example: "SecurePass123" })
  @IsString()
  @MinLength(8)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: "john@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "SecurePass123" })
  @IsString()
  password: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}
```

### Auth Service (modules/auth/services/auth.service.ts)

```typescript
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User } from "../../users/entities/user.entity";
import { RegisterDto, LoginDto } from "../dtos/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, firstName, lastName, password } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      firstName,
      lastName,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    const accessToken = this.generateToken(user);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: ["id", "email", "firstName", "lastName", "password"],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const accessToken = this.generateToken(user);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  async validateUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return user;
  }

  private generateToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
  }

  private sanitizeUser(user: User) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
```

### JWT Strategy (modules/auth/strategies/jwt.strategy.ts)

```typescript
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../services/auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get("JWT_SECRET"),
    });
  }

  validate(payload: any) {
    return this.authService.validateUser(payload.sub);
  }
}
```

### JWT Guard (modules/auth/guards/jwt.guard.ts)

```typescript
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
```

### Current User Decorator (modules/auth/decorators/current-user.decorator.ts)

```typescript
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### Auth Controller (modules/auth/controllers/auth.controller.ts)

```typescript
import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AuthService } from "../services/auth.service";
import { RegisterDto, LoginDto, AuthResponseDto } from "../dtos/auth.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register new user" })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post("login")
  @ApiOperation({ summary: "Login user" })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }
}
```

### Auth Module (modules/auth/auth.module.ts)

```typescript
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { AuthService } from "./services/auth.service";
import { AuthController } from "./controllers/auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET"),
        signOptions: { expiresIn: "24h" },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

---

## Phase 3: Users API

> ✅ Goal: User profile management with GET and UPDATE endpoints.

### User DTOs (modules/users/dtos/user.dto.ts)

```typescript
import { IsEmail, IsString, IsOptional } from "class-validator";
import { ApiProperty, PartialType } from "@nestjs/swagger";

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  createdAt: Date;
}
```

### User Service (modules/users/services/user.service.ts)

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { UpdateUserDto } from "../dtos/user.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }
}
```

### User Controller (modules/users/controllers/user.controller.ts)

```typescript
import { Controller, Get, Put, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { UserService } from "../services/user.service";
import { UpdateUserDto, UserResponseDto } from "../dtos/user.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt.guard";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { User } from "../entities/user.entity";

@ApiTags("Users")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("Authorization")
export class UserController {
  constructor(private userService: UserService) {}

  @Get("profile")
  @ApiOperation({ summary: "Get current user profile" })
  async getProfile(@CurrentUser() user: User): Promise<UserResponseDto> {
    return this.userService.findById(user.id);
  }

  @Put("profile")
  @ApiOperation({ summary: "Update user profile" })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(user.id, updateUserDto);
  }
}
```

### Users Module (modules/users/users.module.ts)

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserService } from "./services/user.service";
import { UserController } from "./controllers/user.controller";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UsersModule {}
```

---

## Phase 4: Boards API

> ✅ Goal: Create, read, update, delete boards with member management.

### Board DTOs (modules/boards/dtos/board.dto.ts)

```typescript
import { IsString, IsOptional, IsArray, IsUUID } from "class-validator";
import { ApiProperty, PartialType } from "@nestjs/swagger";

export class CreateBoardDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  color: string;
}

export class UpdateBoardDto extends PartialType(CreateBoardDto) {}

export class AddMemberDto {
  @ApiProperty()
  @IsUUID()
  userId: string;
}

export class BoardResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  owner: { id: string; email: string; firstName: string; lastName: string };

  @ApiProperty()
  members: Array<{ id: string; email: string }>;

  @ApiProperty()
  createdAt: Date;
}
```

### Board Service (modules/boards/services/board.service.ts)

```typescript
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Board } from "../entities/board.entity";
import { User } from "../../users/entities/user.entity";
import { CreateBoardDto, UpdateBoardDto } from "../dtos/board.dto";

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    ownerId: string,
    createBoardDto: CreateBoardDto,
  ): Promise<Board> {
    const board = this.boardRepository.create({
      ...createBoardDto,
      ownerId,
    });

    return this.boardRepository.save(board);
  }

  async findUserBoards(userId: string) {
    return this.boardRepository
      .createQueryBuilder("board")
      .leftJoinAndSelect("board.owner", "owner")
      .leftJoinAndSelect("board.members", "members")
      .where("board.ownerId = :userId OR members.id = :userId", { userId })
      .getMany();
  }

  async findById(id: string): Promise<Board> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ["owner", "members", "columns"],
    });

    if (!board) {
      throw new NotFoundException("Board not found");
    }

    return board;
  }

  async update(
    id: string,
    userId: string,
    updateBoardDto: UpdateBoardDto,
  ): Promise<Board> {
    const board = await this.findById(id);

    if (board.ownerId !== userId) {
      throw new ForbiddenException("Only board owner can update");
    }

    Object.assign(board, updateBoardDto);
    return this.boardRepository.save(board);
  }

  async delete(id: string, userId: string): Promise<void> {
    const board = await this.findById(id);

    if (board.ownerId !== userId) {
      throw new ForbiddenException("Only board owner can delete");
    }

    await this.boardRepository.remove(board);
  }

  async addMember(
    boardId: string,
    userId: string,
    currentUserId: string,
  ): Promise<Board> {
    const board = await this.findById(boardId);

    if (board.ownerId !== currentUserId) {
      throw new ForbiddenException("Only board owner can add members");
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException("User not found");
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

  async removeMember(
    boardId: string,
    userId: string,
    currentUserId: string,
  ): Promise<Board> {
    const board = await this.findById(boardId);

    if (board.ownerId !== currentUserId) {
      throw new ForbiddenException("Only board owner can remove members");
    }

    board.members = board.members.filter((m) => m.id !== userId);
    return this.boardRepository.save(board);
  }
}
```

### Board Controller (modules/boards/controllers/board.controller.ts)

```typescript
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { BoardService } from "../services/board.service";
import {
  CreateBoardDto,
  UpdateBoardDto,
  AddMemberDto,
  BoardResponseDto,
} from "../dtos/board.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt.guard";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { User } from "../../users/entities/user.entity";

@ApiTags("Boards")
@Controller("boards")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("Authorization")
export class BoardController {
  constructor(private boardService: BoardService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: "Create new board" })
  async create(
    @CurrentUser() user: User,
    @Body() createBoardDto: CreateBoardDto,
  ): Promise<BoardResponseDto> {
    return this.boardService.create(user.id, createBoardDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all boards for current user" })
  async getMyBoards(@CurrentUser() user: User) {
    return this.boardService.findUserBoards(user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get board by ID" })
  async findById(@Param("id") id: string): Promise<BoardResponseDto> {
    return this.boardService.findById(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update board" })
  async update(
    @Param("id") id: string,
    @CurrentUser() user: User,
    @Body() updateBoardDto: UpdateBoardDto,
  ): Promise<BoardResponseDto> {
    return this.boardService.update(id, user.id, updateBoardDto);
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({ summary: "Delete board" })
  async delete(
    @Param("id") id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.boardService.delete(id, user.id);
  }

  @Post(":id/members")
  @ApiOperation({ summary: "Add member to board" })
  async addMember(
    @Param("id") boardId: string,
    @Body() addMemberDto: AddMemberDto,
    @CurrentUser() user: User,
  ): Promise<BoardResponseDto> {
    return this.boardService.addMember(boardId, addMemberDto.userId, user.id);
  }

  @Delete(":id/members/:memberId")
  @ApiOperation({ summary: "Remove member from board" })
  async removeMember(
    @Param("id") boardId: string,
    @Param("memberId") memberId: string,
    @CurrentUser() user: User,
  ): Promise<BoardResponseDto> {
    return this.boardService.removeMember(boardId, memberId, user.id);
  }
}
```

### Boards Module (modules/boards/boards.module.ts)

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Board } from "./entities/board.entity";
import { User } from "../users/entities/user.entity";
import { BoardService } from "./services/board.service";
import { BoardController } from "./controllers/board.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Board, User])],
  providers: [BoardService],
  controllers: [BoardController],
  exports: [BoardService],
})
export class BoardsModule {}
```

---

## Phase 5: Columns API

> ✅ Goal: Create columns (lists) within boards.

### Column DTOs (modules/columns/dtos/column.dto.ts)

```typescript
import { IsString, IsNumber, IsOptional } from "class-validator";
import { ApiProperty, PartialType } from "@nestjs/swagger";

export class CreateColumnDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  position: number;
}

export class UpdateColumnDto extends PartialType(CreateColumnDto) {}

export class ColumnResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  position: number;

  @ApiProperty()
  boardId: string;

  @ApiProperty()
  createdAt: Date;
}
```

### Column Service (modules/columns/services/column.service.ts)

```typescript
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Column } from "../entities/column.entity";
import { Board } from "../../boards/entities/board.entity";
import { CreateColumnDto, UpdateColumnDto } from "../dtos/column.dto";

@Injectable()
export class ColumnService {
  constructor(
    @InjectRepository(Column)
    private columnRepository: Repository<Column>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async create(
    boardId: string,
    createColumnDto: CreateColumnDto,
  ): Promise<Column> {
    // Verify board exists
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });

    if (!board) {
      throw new BadRequestException("Board not found");
    }

    const column = this.columnRepository.create({
      ...createColumnDto,
      boardId,
    });

    return this.columnRepository.save(column);
  }

  async findByBoardId(boardId: string): Promise<Column[]> {
    return this.columnRepository.find({
      where: { boardId },
      order: { position: "ASC" },
      relations: ["tasks"],
    });
  }

  async findById(id: string): Promise<Column> {
    const column = await this.columnRepository.findOne({
      where: { id },
      relations: ["tasks"],
    });

    if (!column) {
      throw new NotFoundException("Column not found");
    }

    return column;
  }

  async update(id: string, updateColumnDto: UpdateColumnDto): Promise<Column> {
    const column = await this.findById(id);
    Object.assign(column, updateColumnDto);
    return this.columnRepository.save(column);
  }

  async delete(id: string): Promise<void> {
    const column = await this.findById(id);
    await this.columnRepository.remove(column);
  }
}
```

### Column Controller (modules/columns/controllers/column.controller.ts)

```typescript
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { ColumnService } from "../services/column.service";
import {
  CreateColumnDto,
  UpdateColumnDto,
  ColumnResponseDto,
} from "../dtos/column.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt.guard";

@ApiTags("Columns")
@Controller("boards/:boardId/columns")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("Authorization")
export class ColumnController {
  constructor(private columnService: ColumnService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: "Create column in board" })
  async create(
    @Param("boardId") boardId: string,
    @Body() createColumnDto: CreateColumnDto,
  ): Promise<ColumnResponseDto> {
    return this.columnService.create(boardId, createColumnDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all columns in board" })
  async getByBoardId(@Param("boardId") boardId: string) {
    return this.columnService.findByBoardId(boardId);
  }

  @Get(":columnId")
  @ApiOperation({ summary: "Get column by ID" })
  async findById(
    @Param("columnId") columnId: string,
  ): Promise<ColumnResponseDto> {
    return this.columnService.findById(columnId);
  }

  @Put(":columnId")
  @ApiOperation({ summary: "Update column" })
  async update(
    @Param("columnId") columnId: string,
    @Body() updateColumnDto: UpdateColumnDto,
  ): Promise<ColumnResponseDto> {
    return this.columnService.update(columnId, updateColumnDto);
  }

  @Delete(":columnId")
  @HttpCode(204)
  @ApiOperation({ summary: "Delete column" })
  async delete(@Param("columnId") columnId: string): Promise<void> {
    return this.columnService.delete(columnId);
  }
}
```

### Columns Module (modules/columns/columns.module.ts)

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Column } from "./entities/column.entity";
import { Board } from "../boards/entities/board.entity";
import { ColumnService } from "./services/column.service";
import { ColumnController } from "./controllers/column.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Column, Board])],
  providers: [ColumnService],
  controllers: [ColumnController],
  exports: [ColumnService],
})
export class ColumnsModule {}
```

---

## Phase 6: Tasks API

> ✅ Goal: Create, update, move tasks with assignments (Many-to-Many).

### Task DTOs (modules/tasks/dtos/task.dto.ts)

```typescript
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  IsArray,
  IsUUID,
} from "class-validator";
import { ApiProperty, PartialType } from "@nestjs/swagger";

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(["low", "medium", "high"])
  priority: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  label: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  position: number;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class AssignTaskDto {
  @ApiProperty()
  @IsUUID()
  userId: string;
}

export class TaskResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  priority: string;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty()
  label: string;

  @ApiProperty()
  assignments: Array<{ id: string; email: string }>;

  @ApiProperty()
  comments: number;

  @ApiProperty()
  createdAt: Date;
}
```

### Task Service (modules/tasks/services/task.service.ts)

```typescript
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task } from "../entities/task.entity";
import { Column } from "../../columns/entities/column.entity";
import { TaskAssignment } from "../entities/task-assignment.entity";
import { User } from "../../users/entities/user.entity";
import { CreateTaskDto, UpdateTaskDto } from "../dtos/task.dto";

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Column)
    private columnRepository: Repository<Column>,
    @InjectRepository(TaskAssignment)
    private assignmentRepository: Repository<TaskAssignment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(columnId: string, createTaskDto: CreateTaskDto): Promise<Task> {
    const column = await this.columnRepository.findOne({
      where: { id: columnId },
    });

    if (!column) {
      throw new BadRequestException("Column not found");
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      columnId,
    });

    return this.taskRepository.save(task);
  }

  async findByColumnId(columnId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { columnId },
      relations: ["assignments", "assignments.user", "comments"],
      order: { position: "ASC" },
    });
  }

  async findById(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ["assignments", "assignments.user", "comments"],
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findById(id);
    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async delete(id: string): Promise<void> {
    const task = await this.findById(id);
    await this.taskRepository.remove(task);
  }

  async moveTask(
    taskId: string,
    newColumnId: string,
    position: number,
  ): Promise<Task> {
    const task = await this.findById(taskId);
    const column = await this.columnRepository.findOne({
      where: { id: newColumnId },
    });

    if (!column) {
      throw new BadRequestException("Target column not found");
    }

    task.columnId = newColumnId;
    task.position = position;
    return this.taskRepository.save(task);
  }

  async assignUser(taskId: string, userId: string): Promise<Task> {
    const task = await this.findById(taskId);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException("User not found");
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

  async unassignUser(taskId: string, userId: string): Promise<Task> {
    const assignment = await this.assignmentRepository.findOne({
      where: { taskId, userId },
    });

    if (assignment) {
      await this.assignmentRepository.remove(assignment);
    }

    return this.findById(taskId);
  }
}
```

### Task Controller (modules/tasks/controllers/task.controller.ts)

```typescript
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { TaskService } from "../services/task.service";
import {
  CreateTaskDto,
  UpdateTaskDto,
  AssignTaskDto,
  TaskResponseDto,
} from "../dtos/task.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt.guard";

@ApiTags("Tasks")
@Controller("columns/:columnId/tasks")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("Authorization")
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: "Create task in column" })
  async create(
    @Param("columnId") columnId: string,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    return this.taskService.create(columnId, createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all tasks in column" })
  async getByColumnId(@Param("columnId") columnId: string) {
    return this.taskService.findByColumnId(columnId);
  }

  @Get(":taskId")
  @ApiOperation({ summary: "Get task by ID" })
  async findById(@Param("taskId") taskId: string): Promise<TaskResponseDto> {
    return this.taskService.findById(taskId);
  }

  @Put(":taskId")
  @ApiOperation({ summary: "Update task" })
  async update(
    @Param("taskId") taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    return this.taskService.update(taskId, updateTaskDto);
  }

  @Delete(":taskId")
  @HttpCode(204)
  @ApiOperation({ summary: "Delete task" })
  async delete(@Param("taskId") taskId: string): Promise<void> {
    return this.taskService.delete(taskId);
  }

  @Put(":taskId/move")
  @ApiOperation({ summary: "Move task to different column" })
  async moveTask(
    @Param("taskId") taskId: string,
    @Body()
    { newColumnId, position }: { newColumnId: string; position: number },
  ): Promise<TaskResponseDto> {
    return this.taskService.moveTask(taskId, newColumnId, position);
  }

  @Post(":taskId/assign")
  @ApiOperation({ summary: "Assign user to task" })
  async assignUser(
    @Param("taskId") taskId: string,
    @Body() assignTaskDto: AssignTaskDto,
  ): Promise<TaskResponseDto> {
    return this.taskService.assignUser(taskId, assignTaskDto.userId);
  }

  @Delete(":taskId/assign/:userId")
  @ApiOperation({ summary: "Unassign user from task" })
  async unassignUser(
    @Param("taskId") taskId: string,
    @Param("userId") userId: string,
  ): Promise<TaskResponseDto> {
    return this.taskService.unassignUser(taskId, userId);
  }
}
```

### Tasks Module (modules/tasks/tasks.module.ts)

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Task } from "./entities/task.entity";
import { Column } from "../columns/entities/column.entity";
import { TaskAssignment } from "./entities/task-assignment.entity";
import { User } from "../users/entities/user.entity";
import { Comment } from "./entities/comment.entity";
import { TaskService } from "./services/task.service";
import { TaskController } from "./controllers/task.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Column, TaskAssignment, User, Comment]),
  ],
  providers: [TaskService],
  controllers: [TaskController],
  exports: [TaskService],
})
export class TasksModule {}
```

---

## Phase 7: Global Error Handling & Testing

> ✅ Goal: Centralized exception handling.

### HTTP Exception Filter (common/filters/http-exception.filter.ts)

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: exception.getResponse(),
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Add to main.ts

```typescript
app.useGlobalFilters(new HttpExceptionFilter());
```

---

## Phase 8: Deployment & Documentation

> ✅ Goal: Production-ready deployment and comprehensive documentation.

### GitHub Setup

```bash
git init
git add .
git commit -m "Initial kanban backend"
git branch -M main
git remote add origin https://github.com/yourusername/kanban-backend.git
git push -u origin main
```

### .gitignore

```
node_modules/
dist/
.env
.env.local
coverage/
.vscode/
.idea/
*.log
.DS_Store
```

### README.md

````markdown
# Kanban Project Management Tool - Backend

Production-ready NestJS + TypeORM + PostgreSQL backend for Kanban project management.

## Features

✅ User authentication with JWT  
✅ Board management with member collaboration  
✅ Columns and task organization  
✅ Task assignments (Many-to-Many relationships)  
✅ Task comments  
✅ Swagger API documentation  
✅ TypeORM with PostgreSQL  
✅ Docker support

## Tech Stack

- NestJS 10.x
- TypeORM 0.3.x
- PostgreSQL 15
- JWT Authentication
- Swagger/OpenAPI

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start PostgreSQL
docker-compose up -d postgres

# Run migrations
npm run migration:run

# Start dev server
npm run start:dev

# Visit Swagger
http://localhost:3000/docs
```
````

## API Endpoints

### Auth

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Users

- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile

### Boards

- `POST /api/boards` - Create board
- `GET /api/boards` - Get user's boards
- `GET /api/boards/:id` - Get board details
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `POST /api/boards/:id/members` - Add member
- `DELETE /api/boards/:id/members/:memberId` - Remove member

### Columns

- `POST /api/boards/:boardId/columns` - Create column
- `GET /api/boards/:boardId/columns` - Get columns
- `PUT /api/boards/:boardId/columns/:columnId` - Update column
- `DELETE /api/boards/:boardId/columns/:columnId` - Delete column

### Tasks

- `POST /api/columns/:columnId/tasks` - Create task
- `GET /api/columns/:columnId/tasks` - Get tasks
- `PUT /api/columns/:columnId/tasks/:taskId` - Update task
- `DELETE /api/columns/:columnId/tasks/:taskId` - Delete task
- `PUT /api/columns/:columnId/tasks/:taskId/move` - Move task
- `POST /api/columns/:columnId/tasks/:taskId/assign` - Assign user
- `DELETE /api/columns/:columnId/tasks/:taskId/assign/:userId` - Unassign user

## Deployment

### Docker

```bash
docker-compose up -d
```

### Render

1. Connect GitHub repo
2. Create PostgreSQL database
3. Set environment variables
4. Deploy

## Project Structure

```
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── boards/
│   ├── columns/
│   └── tasks/
├── config/
├── common/
└── database/
```

## License

MIT

````

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
````

---

## 🎯 Why This Architecture Rocks

✅ **Modular Structure** - Each feature is a self-contained module  
✅ **Type Safety** - Full TypeScript from DB to API  
✅ **Relationship Showcase** - One-to-Many (Boards→Columns→Tasks) & Many-to-Many (Tasks→Users)  
✅ **Clean Code** - Service pattern separates business logic  
✅ **API Documentation** - Auto-generated Swagger docs  
✅ **Scalable** - Ready for adding more features (notifications, real-time, etc.)  
✅ **Production Ready** - Docker, error handling, validation

---

## 🚀 Next Steps

1. **Complete Phase 0** - Setup and run the project
2. **Test Auth** - Register and login in Swagger
3. **Build Boards** - Create and manage boards
4. **Create Columns** - Add columns to boards
5. **Add Tasks** - Create and assign tasks
6. **Deploy** - Push to GitHub and deploy on Render/Railway
7. **Add Real-time** (bonus) - WebSockets for live updates

**Start building your portfolio project!** 🚀
