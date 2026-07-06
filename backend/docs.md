1. REST API Naming Conventions
   A clean REST API maps controllers to specific resource paths.

Auth routes usually don't map to a database entity directly; they map to processes: /auth/register, /auth/login, /auth/logout.

User routes map to the User resource data: /users/profile, /users/:id, /users/update.

If you put updateProfile in the AuthController, your URL would end up looking like /auth/update-profile, which breaks REST conventions because updating a profile isn't an authentication process—it's a data modification process.

2. Guard and Security Scope
   Typically, register and login must be public—anyone can access them without a token.

On the other hand, getUserProfile and updateProfile must be protected by a JwtAuthGuard.

By separating them, you can apply @UseGuards(JwtAuthGuard) at the top of the entire UserController class. Every route inside it is automatically protected.

If you mixed them all into AuthController, you would have to manually apply the guard to individual route methods, which leaves room for human error (e.g., accidentally forgetting to secure a route).

TypeOrmTable
Boards
{ eager: true }: Whenever you fetch a Board, TypeORM will automatically run a SQL JOIN to pull the owner's user information as well.

@JoinColumn({ name: 'ownerId' }): This physically creates a foreign key column named ownerId inside the board table in your database.

Relationship B: The Board Members (ManyToMany)
A board can have multiple team members collaborating on it, and a single user can be a member of multiple boards.

In the Board entity:

```typeScript
@ManyToMany(() => User, (user) => user.boards)
@JoinTable({
  name: 'board_members',
  joinColumn: { name: 'boardId', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
})
members!: User[];
```

Relational databases cannot natively store arrays of keys. To resolve a Many-to-Many relationship, a junction table (or join table) must sit in the middle.

@JoinTable(...): This tells TypeORM to automatically create a third table in your database called board_members with two columns: boardId and userId. You only place this decorator on one side of the relationship (in this case, Board).

Prisma equivelent

```bash
model User {
  id              String   @id @default(uuid())
  email           String   @unique
  firstName       String?
  lastName        String?
  password        String
  role            String   @default("user")
  isEmailVerified Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // 1. One-to-Many: Boards this user created
  ownedBoards     Board[]  @relation("BoardOwner")

  // 2. Many-to-Many: Boards this user belongs to as a member
  boards          Board[]  @relation("BoardMembers")
}

model Board {
  id          String   @id @default(uuid())
  title       String
  description String?
  color       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 1. Many-to-One: The Owner relation mapping
  owner       User     @relation("BoardOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  ownerId     String

  // 2. Many-to-Many: The Members relation mapping
  // Prisma automatically creates the underlying join table for you!
  members     User[]   @relation("BoardMembers")
}
```

```typescript
return (
  this.boardRepository
    // 1. "Hey TypeORM, let's build a custom SQL query starting from the Board table."
    //    We give the board table a nickname (alias) of "board".
    .createQueryBuilder('board')

    // 2. "Pull in the owner's information for each board."
    //    This runs a SQL LEFT JOIN on the owner relationship and gives it the alias "owner".
    .leftJoinAndSelect('board.owner', 'owner')

    // 3. "Pull in all the members for each board."
    //    This automatically hops through your 'board_members' junction table,
    //    fetches the users, and aliases them as "members".
    .leftJoinAndSelect('board.members', 'members')

    // 4. "Filter the results! Only give me boards where:"
    //    - The board's ownerId matches the userId parameter
    //    - OR the ID of any member inside the members array matches the userId parameter.
    .where('board.ownerId = :userId OR members.id = :userId', { userId })

    // 5. "Execute the query and return the results as an array of Board objects."
    .getMany()
);
```
