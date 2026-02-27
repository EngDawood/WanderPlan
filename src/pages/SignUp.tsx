import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && name) {
      signIn(email, name);
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
        <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
        <p className="text-gray-500 mt-2">Start planning your next adventure today.</p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4 flex-1">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
              placeholder="John Doe"
            />
          </div>
        </div>

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
        </div>

        <div className="pt-4 space-y-3">
          <button
            type="submit"
            className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign Up
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
          Already have an account?{' '}
          <button onClick={() => navigate('/signin')} className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
