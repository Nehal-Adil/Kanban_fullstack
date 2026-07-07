# Kanban Frontend Roadmap 🎨

## React + TypeScript + Vite + Tailwind

---

## Why React (Not Next.js)?

| Feature            | React              | Next.js            |
| ------------------ | ------------------ | ------------------ |
| **Build Speed**    | ⚡ Vite (fastest)  | 🚀 Fast but slower |
| **Learning Curve** | Easy               | More concepts      |
| **For SPA**        | Perfect            | Overkill           |
| **SEO Needed**     | ❌ Nope            | ✅ Built-in        |
| **API Routes**     | Use backend ✅     | Not needed         |
| **Portfolio**      | Shows React skills | Shows full-stack   |
| **Dev Experience** | Excellent          | Very good          |

**Decision: React + Vite** ✅

You already have a solid backend, so a pure SPA with React is perfect for learning frontend fundamentals and component architecture.

---

## Tech Stack

```
Frontend Framework: React 18 + TypeScript
Build Tool: Vite
Styling: Tailwind CSS
Routing: React Router v6
State Management: Zustand (client) + TanStack Query (server)
Forms: React Hook Form + Zod
HTTP Client: Axios
Components: Shadcn/ui (optional but recommended)
```

---

## Project Structure

```
/src
  /pages
    LoginPage.tsx
    RegisterPage.tsx
    BoardsPage.tsx
    BoardDetailPage.tsx
  /components
    /auth
      LoginForm.tsx
      RegisterForm.tsx
    /boards
      BoardCard.tsx
      BoardList.tsx
      CreateBoardModal.tsx
    /columns
      ColumnCard.tsx
      ColumnList.tsx
      CreateColumnModal.tsx
    /tasks
      TaskCard.tsx
      TaskModal.tsx
      TaskForm.tsx
    /common
      Navbar.tsx
      Sidebar.tsx
      LoadingSpinner.tsx
  /hooks
    useAuth.ts
    useBoard.ts
    useTasks.ts
  /services
    api.ts
    auth.ts
    board.ts
    task.ts
  /store
    authStore.ts
    boardStore.ts
  /types
    index.ts
    auth.ts
    board.ts
    task.ts
  App.tsx
  main.tsx

.env.example
.env.local
vite.config.ts
tailwind.config.js
```

---

## Phase 0: Project Setup & Configuration

> ✅ Goal: Create Vite + React project with TypeScript, Tailwind, and project structure.

### What to do:

1. **Create Vite React project:**

   ```bash
   npm create vite@latest kanban-frontend -- --template react-ts
   cd kanban-frontend
   npm install
   ```

2. **Install dependencies:**
   - React Router for navigation
   - Tailwind CSS for styling
   - TanStack Query for server state
   - Zustand for client state
   - Axios for API calls
   - React Hook Form for forms
   - Zod for validation
   - Shadcn/ui for pre-built components (optional)

3. **Setup Tailwind CSS** - Configure for Vite

4. **Create folder structure** as shown above

5. **Setup environment variables:**
   - `VITE_API_URL=http://localhost:3000/api`

6. **Setup main routing** - Create App.tsx with React Router and basic routes:
   - `/login`
   - `/register`
   - `/boards`
   - `/boards/:id`

7. **Setup API service** - Create axios instance with:
   - Base URL from environment
   - Authorization header interceptor (add Bearer token)
   - Error handling

### Tips:

- Vite is much faster than Create React App
- Keep TypeScript strict mode on
- Use `.tsx` for components, `.ts` for utilities

**When done:**

- App should run with `npm run dev`
- Pages should exist (even if empty)
- Routes should navigate between pages

---

## Phase 1: Authentication Pages & Store

> ✅ Goal: Create login/register pages and auth state management.

### What to do:

1. **Create auth types** (`/types/auth.ts`):
   - User type (id, email, firstName, lastName)
   - Login/Register request/response types

2. **Create auth store** with Zustand:
   - Store: user, token, isAuthenticated
   - Actions: setAuth, logout, getToken
   - Persist token in localStorage

3. **Create Login page** (`/pages/LoginPage.tsx`):
   - Email and password inputs
   - Submit to backend `/api/auth/login`
   - On success: save token and redirect to `/boards`
   - On error: show error message

4. **Create Register page** (`/pages/RegisterPage.tsx`):
   - Email, firstName, lastName, password inputs
   - Submit to backend `/api/auth/register`
   - On success: save token and redirect to `/boards`
   - Validate password strength

5. **Create Login/Register forms** as separate components

6. **Add authentication guard:**
   - Create a PrivateRoute component
   - Redirect to `/login` if not authenticated
   - Wrap `/boards` routes with this

### Tips:

- Use React Hook Form for form handling
- Use Zod for validation
- Store token in localStorage but read from store
- Add loading state while submitting
- Use Tailwind for styling forms
- Show password toggle on password input

**When done:**

- Can register a new user
- Can login with credentials
- Token is stored in localStorage
- Redirects to `/boards` after login
- `/boards` route is protected

---

## Phase 2: Navbar & Layout Components

> ✅ Goal: Create header/navbar and basic layout structure.

### What to do:

1. **Create Navbar component:**
   - Logo/title
   - Links: Boards, Profile
   - User menu (dropdown) with:
     - Profile link
     - Logout button
   - Use auth store to show user name

2. **Create main layout wrapper:**
   - Navbar at top
   - Content area below
   - Responsive design

3. **Create sidebar** (optional):
   - Quick board links
   - Can be collapsible

4. **Create common UI components:**
   - Button component
   - Modal/Dialog component
   - Loading spinner
   - Error message component

### Tips:

- Use Tailwind for styling
- Make responsive (mobile-first)
- Navbar should show current user
- Logout should clear store and redirect to login
- Can use Shadcn/ui for pre-built components

**When done:**

- Navbar appears on all pages
- User can see their name
- Logout button works
- Layout looks professional

---

## Phase 3: Boards Page & Listing

> ✅ Goal: Display user's boards and create new boards.

### What to do:

1. **Create board types** (`/types/board.ts`):
   - Board interface
   - CreateBoardRequest type
   - BoardResponse type

2. **Create board service** (`/services/board.ts`):
   - Functions to call backend: getBoards(), createBoard(), updateBoard(), deleteBoard()
   - Return typed responses

3. **Create boards page** (`/pages/BoardsPage.tsx`):
   - Show list of user's boards
   - Show "Create Board" button
   - Each board as a clickable card

4. **Create BoardCard component:**
   - Display board title, description, color
   - Click to navigate to board detail page
   - Show edit/delete icons (for owner)

5. **Create BoardList component:**
   - Display multiple BoardCards
   - Show empty state if no boards
   - Show loading state while fetching

6. **Use TanStack Query:**
   - Fetch boards with `useQuery`
   - Handle loading, error, data states
   - Auto-refetch when needed

7. **Create CreateBoardModal:**
   - Form with title, description, color
   - Submit creates board
   - On success: refetch boards list
   - Modal closes after success

### Tips:

- Use TanStack Query for server state (caching, refetching)
- Keep components small and focused
- Each board card should be clickable
- Show loading spinner while fetching
- Handle error states gracefully

**When done:**

- See list of your boards
- Can create new board
- New board appears in list immediately
- Can click board to see detail

---

## Phase 4: Board Detail Page & Columns

> ✅ Goal: Display single board with its columns and ability to create columns.

### What to do:

1. **Create column types** (`/types/board.ts`):
   - Column interface (id, title, position, tasks)

2. **Create column service** (`/services/board.ts`):
   - getColumns(boardId)
   - createColumn(boardId, title)
   - updateColumn(boardId, columnId, data)
   - deleteColumn(boardId, columnId)

3. **Create BoardDetailPage:**
   - Get boardId from URL params (`useParams`)
   - Fetch board details
   - Fetch columns for that board
   - Display board title/description
   - Display columns in a row layout (Kanban style)

4. **Create ColumnCard component:**
   - Show column title
   - Show list of tasks (from backend)
   - Show "Add Task" button
   - Actions: edit, delete (if owner)

5. **Create CreateColumnModal:**
   - Form with column title
   - Submit creates column
   - Refetch columns after creation

6. **Organize layout:**
   - Horizontal scrollable columns
   - Drag-and-drop ready (Tailwind grid or flexbox)

### Tips:

- Use `useParams` hook to get boardId from URL
- Each column should show its tasks
- Columns should display in order (by position)
- Create a custom hook `useBoard(boardId)` for reusable logic
- Handle board not found error

**When done:**

- Click on board from list → goes to detail page
- See board title and all columns
- Can create new column
- Columns show their tasks
- Can edit/delete columns

---

## Phase 5: Tasks & Task Management

> ✅ Goal: Create, read, update, delete tasks within columns.

### What to do:

1. **Create task types** (`/types/task.ts`):
   - Task interface (id, title, priority, dueDate, assignments)
   - TaskAssignment interface

2. **Create task service** (`/services/task.ts`):
   - createTask(columnId, data)
   - updateTask(columnId, taskId, data)
   - deleteTask(columnId, taskId)
   - moveTask(taskId, newColumnId, position)
   - assignUser(taskId, userId)
   - unassignUser(taskId, userId)

3. **Create TaskCard component:**
   - Show title, priority (color-coded), due date
   - Show assigned users as avatars
   - Click to open task detail
   - Drag-and-drop ready styling

4. **Create TaskModal/TaskDetailPage:**
   - Show full task details
   - Edit form (title, description, priority, due date)
   - Show and manage assignments
   - Show comments (if implemented)
   - Delete button

5. **Create TaskForm component:**
   - Input fields for title, description, priority, dueDate
   - Use React Hook Form + Zod validation
   - Submit to backend

6. **Create AssignmentSection:**
   - Show list of assigned users
   - Add/remove assignments
   - Dropdown to select user from board members

7. **Implement Drag-and-Drop** (optional but nice):
   - Move tasks between columns
   - Reorder within column
   - Use react-beautiful-dnd or react-dnd

### Tips:

- Prioritize completion over drag-and-drop
- Can use simple buttons to move tasks first
- Use modal for task details
- Color-code priorities (low, medium, high)
- Show due date in relative format (Today, Tomorrow, 2 days left)
- Disable edit if not in your board

**When done:**

- See all tasks in columns
- Can create task in any column
- Can open task and edit details
- Can assign users to tasks
- Can delete tasks
- Can move tasks between columns

---

## Phase 6: User Assignment & Comments (Bonus)

> ✅ Goal: Manage task assignments and add comments (if time permits).

### What to do:

1. **Assignments feature:**
   - Show assigned users on task card
   - Click task → see assignments
   - Add/remove assignments with dropdown
   - Only show board members in dropdown

2. **Comments feature** (optional):
   - Show comments on task detail
   - Add new comment form
   - Comment author and timestamp
   - Simple, clean design

### Tips:

- Assignments are the priority
- Comments can be added later
- Keep UI clean - don't overload task card

**When done:**

- Can see who is assigned to each task
- Can add/remove assignments
- Assignments persist in backend

---

## Phase 7: Loading States, Error Handling & UI Polish

> ✅ Goal: Professional loading states and error handling throughout.

### What to do:

1. **Add loading states:**
   - Skeleton loaders for boards/columns/tasks
   - Disable buttons while submitting
   - Show spinners while fetching

2. **Error handling:**
   - Show error toast for failed actions
   - Handle network errors gracefully
   - Retry buttons for failed requests

3. **Toast notifications:**
   - Success message after actions
   - Error messages with details
   - Use react-hot-toast or similar

4. **Edge cases:**
   - Empty states (no boards, no tasks)
   - 404 if board not found
   - Unauthorized access handling
   - Network offline detection

### Tips:

- Use consistent error messaging
- Make loading states visible
- Don't let users submit twice
- Handle token expiration (redirect to login)

**When done:**

- App handles all loading states
- Errors show clearly
- Success notifications appear
- No console errors

---

## Phase 8: Responsive Design & Mobile

> ✅ Goal: Make app work on mobile and tablet.

### What to do:

1. **Mobile-first design:**
   - Test on mobile devices
   - Stack columns vertically on small screens
   - Hamburger menu for navigation

2. **Responsive breakpoints:**
   - Small (mobile): <640px
   - Medium (tablet): 640px-1024px
   - Large (desktop): >1024px

3. **Touch-friendly:**
   - Larger buttons for touch
   - Scrollable columns on mobile

### Tips:

- Use Tailwind responsive classes (`sm:`, `md:`, `lg:`)
- Test on real devices or browser dev tools
- Horizontal scroll for columns on mobile is fine

**When done:**

- Works on phone, tablet, desktop
- No horizontal scroll on small screens (except column list)

---

## Phase 9: Deployment & Documentation

> ✅ Goal: Deploy frontend and document.

### What to do:

1. **Setup GitHub:**

   ```bash
   git init
   git add .
   git commit -m "Initial kanban frontend"
   git remote add origin https://github.com/yourusername/kanban-frontend.git
   git push -u origin main
   ```

2. **Create .env.example** with required variables

3. **Create comprehensive README:**
   - Features list
   - Tech stack
   - Setup instructions
   - How to run locally
   - Build & deploy instructions
   - Screenshots (if you want to look pro)

4. **Deploy to Vercel or Netlify:**
   - Connect GitHub repo
   - Set environment variables
   - Auto-deploy on push
   - Done!

5. **Update backend README** with frontend link

### Tips:

- Vercel is easiest (made by Next.js creators but works great with React)
- Netlify is also excellent
- Both have free tier
- Set API URL in CI/CD environment variables

**When done:**

- Code on GitHub
- Frontend deployed and live
- Can share live link in portfolio

---

## 🎯 Expected Timeline

- **Phase 0-1**: 1-2 hours (setup + auth)
- **Phase 2-3**: 2-3 hours (layout + boards)
- **Phase 4-5**: 4-5 hours (columns + tasks)
- **Phase 6-7**: 2-3 hours (assignments + polish)
- **Phase 8-9**: 2-3 hours (responsive + deploy)

**Total: 12-16 hours of focused work**

---

## Key Concepts to Learn

- **Hooks**: useState, useEffect, useContext, useParams, useNavigate
- **TanStack Query**: useQuery, useMutation, queryClient.invalidateQueries
- **Zustand**: Store creation, actions, persistence
- **React Router**: Routes, Link, useParams, useNavigate
- **React Hook Form**: useForm, Controller, validation
- **Tailwind**: Responsive design, component composition

---

## 📋 Checklist Before Moving to Next Phase

- Previous phase working correctly ✅
- No console errors ✅
- Loads data from backend ✅
- Can complete all actions ✅

---

## 🚨 Get Stuck?

When you hit a wall:

1. **What phase you're on**
2. **What you're trying to do**
3. **What error/issue you're facing**
4. **What you've tried**

I'll help without giving full code! 💪

---

## Start Phase 0!

Create the Vite project and let me know when:

- Project runs with `npm run dev`
- Folder structure is set up
- Tailwind CSS is working
- Basic routes exist

Then we move to Phase 1! 🚀
