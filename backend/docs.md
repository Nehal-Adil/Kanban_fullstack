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
