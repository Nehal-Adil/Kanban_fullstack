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
