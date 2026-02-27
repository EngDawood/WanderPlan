import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      signIn(email);
      navigate('/');
    }
  };

  const handleGuestSignIn = () => {
    signIn('guest@wanderplan.com', 'Guest');
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full bg-white p-6">
      <div className="mt-12 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-gray-500 mt-2">Sign in to continue planning your trips.</p>
      </div>

      <form onSubmit={handleSignIn} className="space-y-4 flex-1">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={20} className="text-gray-400" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={20} className="text-gray-400" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
              placeholder="••••••••"
            />
          </div>
          <div className="flex justify-end mt-2">
            <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Forgot password?
            </button>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <button
            type="submit"
            className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign In
            <ArrowRight size={20} className="ml-2" />
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <button
            type="button"
            onClick={handleGuestSignIn}
            className="w-full flex items-center justify-center py-4 px-4 border border-gray-200 rounded-xl shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <UserCircle size={20} className="mr-2 text-gray-500" />
            Continue as Guest
          </button>
        </div>
      </form>

      <div className="mt-8 text-center pb-safe">
        <p className="text-gray-500">
          Don't have an account?{' '}
          <button onClick={() => navigate('/signup')} className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
