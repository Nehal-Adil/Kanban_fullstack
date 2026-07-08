# NestJS Kanban Backend Roadmap 🗂️

## Step-by-Step Guide (Complete Tasks, Ask If Stuck)

---

## Phase 0: Project Setup & Configuration

> ✅ Goal: Initialize a clean NestJS project with TypeORM and PostgreSQL connection.

### What to do:

1. **Create NestJS project:**

   ```bash
   npm i -g @nestjs/cli
   nest new kanban-backend
   cd kanban-backend
   ```

2. **Install core dependencies** for NestJS, TypeORM, PostgreSQL, JWT, and validation

3. **Setup folder structure** with:
   - `/modules` (auth, users, boards, columns, tasks)
   - `/config` (database, environment)
   - `/database` (migrations folder)
   - `/common` (decorators, guards, filters)

4. **Create `.env` and `.env.example`** with:
   - Database credentials (host, port, user, password, database name)
   - JWT secret and expiration
   - API details (port, prefix)

5. **Configure TypeORM** in a config file that reads from `.env`

6. **Setup docker-compose.yml** with PostgreSQL service for local development

7. **Create main.ts** with:
   - Global ValidationPipe
   - Swagger documentation setup
   - CORS enabled
   - API prefix `/api`

### Key files to create:

- `src/config/database.config.ts`
- `src/config/env.config.ts`
- `src/app.module.ts`
- `src/main.ts`
- `.env`, `.env.example`
- `docker-compose.yml`

### Tips:

- Use `@nestjs/config` for environment variables
- Use `@nestjs/swagger` decorators on entities for auto-documentation
- Keep it simple - just get the server running first

**When done:** Server should start with `npm run start:dev` and show Swagger docs at `http://localhost:3000/docs`

---

## Phase 1: Database Schema & Entities

> ✅ Goal: Design and create all TypeORM entities with proper relationships.

### What to do:

1. **Create User entity** with:
   - Basic fields: email (unique), firstName, lastName, password, role
   - Relationships: owns many boards, member of many boards, assigned to many tasks
   - Timestamps: createdAt, updatedAt

2. **Create Board entity** with:
   - Fields: title, description, color
   - Relationships: owned by one user, has many members (Many-to-Many with User), has many columns
   - Timestamps

3. **Create Column entity** with:
   - Fields: title, position (for ordering)
   - Relationships: belongs to one board, has many tasks
   - Timestamps

4. **Create Task entity** with:
   - Fields: title, description, priority, dueDate, label, position
   - Relationships: belongs to one column, assigned to many users (Many-to-Many), has many comments
   - Timestamps

5. **Create TaskAssignment entity** (junction table) for Many-to-Many between Task and User

6. **Create Comment entity** (bonus feature) with:
   - Fields: content
   - Relationships: belongs to task, written by user

### Key relationships to implement:

- **One-to-Many**: Board → Columns, Column → Tasks, Task → Comments
- **Many-to-Many**: User ↔ Board (members), Task ↔ User (assignments)

### Tips:

- Use `@Entity()`, `@Column()`, `@ManyToOne()`, `@OneToMany()`, `@ManyToMany()` decorators
- Setup `onDelete: 'CASCADE'` for proper cleanup
- Add `eager: true` where needed for automatic relation loading
- Use UUID for all primary keys

**When done:**

- Run `npm run migration:generate` to create initial migration
- Run `npm run migration:run` to apply it
- Check PostgreSQL to verify tables exist

---

## Phase 2: Authentication System

> ✅ Goal: Implement JWT-based authentication with login and registration.

### What to do:

1. **Create Auth DTOs:**
   - `RegisterDto` (email, firstName, lastName, password)
   - `LoginDto` (email, password)
   - `AuthResponseDto` (accessToken, user object)

2. **Create Auth Service** with:
   - `register()` - hash password with bcryptjs, save user, return token
   - `login()` - verify password, return token
   - `validateUser()` - used by JWT strategy
   - Helper method to sanitize user (remove password)

3. **Create JWT Strategy** using `@nestjs/passport`

4. **Create JWT Guard** to protect routes

5. **Create CurrentUser Decorator** to inject user into controller methods

6. **Create Auth Controller** with:
   - `POST /auth/register`
   - `POST /auth/login`

7. **Create Auth Module** and export for use in other modules

### Tips:

- Use `bcryptjs` to hash passwords
- JWT payload should contain `sub` (user ID) and `email`
- Token should expire in 24 hours
- Passwords should be selected with `select: false` in User queries

**When done:**

- Test `/auth/register` in Swagger - should create user
- Test `/auth/login` - should return accessToken
- Use that token in other endpoints by clicking "Authorize" in Swagger

---

## Phase 3: Users API

> ✅ Goal: Create endpoints for user profile management.

### What to do:

1. **Create User DTOs:**
   - `UpdateUserDto` (firstName, lastName - optional)
   - `UserResponseDto` (id, email, firstName, lastName, createdAt)

2. **Create User Service** with:
   - `findById()` - get user by ID
   - `update()` - update user profile
   - `findByEmail()` - helper for auth

3. **Create User Controller** with:
   - `GET /users/profile` - get current user (protected)
   - `PUT /users/profile` - update current user (protected)
   - Both should use `@CurrentUser()` decorator

4. **Create Users Module** and import in AppModule

### Tips:

- Use `@UseGuards(JwtAuthGuard)` to protect routes
- Use `@ApiBearerAuth()` decorator in Swagger
- Return sanitized user (no password)

**When done:**

- Login and get token
- Use that token to access `/users/profile`
- Should see only your user data
- Update profile and verify changes

---

## Phase 4: Boards API

> ✅ Goal: Create CRUD operations for boards with owner and member management.

### What to do:

1. **Create Board DTOs:**
   - `CreateBoardDto` (title, description, color)
   - `UpdateBoardDto` (partial)
   - `AddMemberDto` (userId)
   - `BoardResponseDto` (id, title, owner, members, columns)

2. **Create Board Service** with:
   - `create()` - create board owned by current user
   - `findUserBoards()` - get all boards user owns or is member of
   - `findById()` - get board with relations
   - `update()` - only owner can update
   - `delete()` - only owner can delete
   - `addMember()` - add user to board (Many-to-Many)
   - `removeMember()` - remove user from board

3. **Create Board Controller** with:
   - `POST /boards` - create
   - `GET /boards` - get user's boards
   - `GET /boards/:id` - get one
   - `PUT /boards/:id` - update
   - `DELETE /boards/:id` - delete
   - `POST /boards/:id/members` - add member
   - `DELETE /boards/:id/members/:memberId` - remove member

4. **Create Boards Module**

### Tips:

- Use `QueryBuilder` for complex queries (find boards where user is owner OR member)
- Check ownership before allowing updates/deletes
- Relations should be eager loaded
- Test adding/removing members carefully

**When done:**

- Create a board
- Get all your boards
- Add another user as member
- Update and delete board
- Verify only owner can modify

---

## Phase 5: Columns API

> ✅ Goal: Create columns (lists) within boards.

### What to do:

1. **Create Column DTOs:**
   - `CreateColumnDto` (title, position)
   - `UpdateColumnDto` (partial)
   - `ColumnResponseDto` (id, title, position, boardId, taskCount)

2. **Create Column Service** with:
   - `create()` - create column in board
   - `findByBoardId()` - get all columns in board (ordered by position)
   - `findById()` - get column with tasks
   - `update()` - update column
   - `delete()` - delete column (cascade deletes tasks)

3. **Create Column Controller** with:
   - Routes nested under `/boards/:boardId/columns`
   - All CRUD operations

4. **Create Columns Module**

### Tips:

- Route should be `POST /api/boards/:boardId/columns` (nested routes)
- Position field helps with drag-and-drop ordering
- Always verify board exists before creating column
- Load tasks relation when fetching

**When done:**

- Create a board first
- Create multiple columns in that board
- Get all columns
- Update and delete columns

---

## Phase 6: Tasks API

> ✅ Goal: Create tasks with Many-to-Many assignments to users.

### What to do:

1. **Create Task DTOs:**
   - `CreateTaskDto` (title, description, priority, dueDate, label, position)
   - `UpdateTaskDto` (partial)
   - `TaskResponseDto` (id, title, priority, assignments with user details, comments count)
   - `AssignTaskDto` (userId)

2. **Create Task Service** with:
   - `create()` - create task in column
   - `findByColumnId()` - get all tasks in column with assignments
   - `findById()` - get task with relations
   - `update()` - update task
   - `delete()` - delete task
   - `moveTask()` - move task to different column (change columnId and position)
   - `assignUser()` - assign user (create TaskAssignment)
   - `unassignUser()` - remove assignment

3. **Create Task Controller** with:
   - Routes nested under `/columns/:columnId/tasks`
   - All CRUD operations
   - `PUT /:taskId/move` - move to different column
   - `POST /:taskId/assign` - assign user
   - `DELETE /:taskId/assign/:userId` - unassign user

4. **Create Tasks Module**

### Tips:

- Many-to-Many through TaskAssignment entity
- When assigning, check if already assigned (avoid duplicates)
- Load assignments with user details when fetching tasks
- Drag-and-drop requires position tracking

**When done:**

- Create tasks in columns
- Assign multiple users to one task
- Unassign users
- Move tasks between columns
- Verify all assignments are correct

---

## Phase 7: Global Error Handling & Validation

> ✅ Goal: Centralized exception handling across application.

### What to do:

1. **Create HTTP Exception Filter** that catches `HttpException` and formats error responses

2. **Create Global Exceptions Filter** for unexpected errors

3. **Apply globally in main.ts** using `app.useGlobalFilters()`

4. **Test with invalid inputs:**
   - Missing required fields
   - Invalid UUIDs
   - Accessing others' boards

### Tips:

- Filters should return consistent error format with statusCode, message, timestamp
- Use appropriate HTTP status codes (400, 401, 403, 404, 500)
- Log errors for debugging

**When done:**

- Invalid requests should return formatted errors
- Unauthorized access should return 403
- Not found should return 404

---

## Phase 8: Testing

> Optional but recommended for portfolio.

### What to do:

1. **Write unit tests for services:**
   - Auth service (register, login, validate)
   - User service (findById, update)
   - Board service (create, ownership checks)

2. **Run tests:** `npm run test`

### Tips:

- Use Jest (comes with NestJS)
- Mock repositories using `jest.fn()`
- Test both success and error cases

---

## Phase 9: Documentation & Deployment

> ✅ Goal: Push to GitHub and deploy.

### What to do:

1. **Setup Git:**

   ```bash
   git init
   git add .
   git commit -m "Initial kanban backend"
   git remote add origin https://github.com/yourusername/kanban-backend.git
   git push -u origin main
   ```

2. **Create .gitignore** (node_modules, dist, .env, coverage)

3. **Create comprehensive README.md** with:
   - Features list
   - Tech stack
   - Quick start instructions
   - API endpoints overview
   - Project structure

4. **Deploy to Render or Railway:**
   - Connect GitHub repo
   - Add PostgreSQL database
   - Set environment variables
   - Deploy

### Tips:

- README should be clear enough for someone to understand and run locally
- Include Swagger docs URL in README
- Document all major endpoints

**When done:**

- Code on GitHub
- Live deployed API
- Can share live Swagger link: `https://your-deployed-url/docs`

---

## 🎯 Expected Timeline

- **Phase 0-1**: 1-2 hours (setup + entities)
- **Phase 2-3**: 2-3 hours (auth + users)
- **Phase 4-6**: 4-5 hours (boards, columns, tasks)
- **Phase 7-9**: 2-3 hours (error handling, testing, deployment)

**Total: 10-15 hours of focused work**

---

## 📋 Key Concepts to Understand

- **One-to-Many**: Board has many Columns
- **Many-to-Many**: Task has many Users through TaskAssignment
- **JWT Authentication**: Token-based, stateless
- **Guards & Decorators**: Protect routes and inject data
- **DTOs & Validation**: Type safety and input validation
- **Services**: Business logic separate from controllers

---

## 🚨 Get Stuck?

When you hit a wall, come back with:

1. **What phase you're on**
2. **What you're trying to do**
3. **What error you're getting** (exact error message)
4. **What you've tried so far**

I'll help you debug without giving you the full solution.

**Start with Phase 0 and let me know when you're ready to move to Phase 1!** 🚀
