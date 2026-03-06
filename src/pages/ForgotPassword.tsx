import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!isFirebaseConfigured || !auth) {
      setError('Firebase is not configured. Please add your Firebase API keys to the environment variables.');
      return;
    }

    setLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found' || err.message?.includes('auth/user-not-found')) {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email' || err.message?.includes('auth/invalid-email')) {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Failed to send password reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white p-6">
      <button 
        onClick={() => navigate('/signin')}
        className="self-start p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="mt-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
        <p className="text-gray-500 mt-2">Enter your email address and we'll send you a link to reset your password.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start">
          <AlertCircle size={20} className="text-red-500 mt-0.5 mr-3 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start">
          <CheckCircle size={20} className="text-green-500 mt-0.5 mr-3 shrink-0" />
          <p className="text-sm text-green-700">
            Password reset email sent! Check your inbox for further instructions.
          </p>
        </div>
      )}

      <form onSubmit={handleResetPassword} className="space-y-4 flex-1">
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

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </div>
      </form>
    </div>
  );
}
