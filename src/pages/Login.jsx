import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, supabase } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Log environment variables status on component mount
    console.log('Login: Component mounted');
    console.log('Login: VITE_SUPABASE_URL present:', !!import.meta.env.VITE_SUPABASE_URL);
    console.log('Login: VITE_SUPABASE_KEY present:', !!import.meta.env.VITE_SUPABASE_KEY);
    console.log('Login: Supabase client initialized:', !!supabase);
  }, [supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login: Form submitted');
    
    if (!email || !password) {
      console.warn('Login: Missing email or password');
      toast.error('Please enter both email and password');
      return;
    }
    
    console.log('Login: Attempting sign in with email:', email);
    setLoading(true);
    
    try {
      console.log('Login: Calling signIn function');
      const { data, error } = await signIn(email, password);
      
      if (error) {
        console.error('Login: Sign in error:', error.message);
        toast.error(error.message || 'Failed to sign in');
      } else if (data?.user) {
        console.log('Login: Sign in successful, user:', data.user.email);
        toast.success('Signed in successfully');
        navigate('/');
      } else {
        console.warn('Login: No error but no user data returned');
        toast.error('No user data returned from authentication');
      }
    } catch (error) {
      console.error('Login: Exception during sign in:', error);
      toast.error('An unexpected error occurred');
    } finally {
      console.log('Login: Sign in attempt completed');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/logo.svg"
          alt="OMA Health Assistant"
        />
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        {!import.meta.env.VITE_SUPABASE_URL && (
          <div className="mt-2 text-center text-sm text-red-600">
            Warning: VITE_SUPABASE_URL is not configured
          </div>
        )}
        {!import.meta.env.VITE_SUPABASE_KEY && (
          <div className="mt-2 text-center text-sm text-red-600">
            Warning: VITE_SUPABASE_KEY is not configured
          </div>
        )}
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
