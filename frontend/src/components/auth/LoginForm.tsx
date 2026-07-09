import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authService.login(data);
      setAuth(response.user, response.accessToken);
      toast.success('Login successful');
      navigate('/boards');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        toast.error(error.message);
      } else {
        console.error('An unexpected error occurred', error);
        toast.error('An unexpected error occurred');
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md mx-auto space-y-4"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          {...register('email')}
          type="email"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="john@example.com"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          {...register('password')}
          type="password"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>

      <p className="text-center text-sm">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-500 hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;
