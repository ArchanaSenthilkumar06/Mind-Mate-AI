import React, { useState, FormEvent } from 'react';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface AuthPageProps {
  onLogin: (email: string, password_raw: string) => Promise<void>;
  onSignUp: (name: string, email: string, password_raw: string) => Promise<void>;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onSignUp }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        await onSignUp(name, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center animate-fade-in pt-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-stone-900 rounded-2xl shadow-xl border border-stone-800">
        <div className="text-center">
            <div className="inline-block p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl text-white shadow-lg mb-4">
                <BookOpenIcon className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-stone-100">
                {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="mt-2 text-sm text-stone-400">
                {isLogin ? 'Sign in to access your study plans.' : 'Get started with your AI learning companion.'}
            </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
                 <div>
                    <label htmlFor="name" className="text-sm font-medium text-stone-300">Name</label>
                    <input id="name" name="name" type="text" required className="mt-1 block w-full px-3 py-2 bg-stone-800 border border-stone-700 text-stone-100 rounded-lg shadow-sm placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"/>
                </div>
            )}
            <div>
                <label htmlFor="email" className="text-sm font-medium text-stone-300">Email address</label>
                <input id="email" name="email" type="email" autoComplete="email" required className="mt-1 block w-full px-3 py-2 bg-stone-800 border border-stone-700 text-stone-100 rounded-lg shadow-sm placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"/>
            </div>
            <div>
                <label htmlFor="password"className="text-sm font-medium text-stone-300">Password</label>
                <input id="password" name="password" type="password" autoComplete="current-password" required className="mt-1 block w-full px-3 py-2 bg-stone-800 border border-stone-700 text-stone-100 rounded-lg shadow-sm placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"/>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            
            <div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                </button>
            </div>
        </form>

        <p className="text-center text-sm text-stone-400">
          {isLogin ? "Don't have an account?" : 'Already have an an account?'}
          <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="font-semibold text-amber-500 hover:text-amber-400 ml-1">
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;