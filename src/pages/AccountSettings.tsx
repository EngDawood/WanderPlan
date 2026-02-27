import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AccountSettings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-2">Manage your account details and preferences.</p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Profile Information</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <User size={20} className="text-gray-400 mr-3" />
                <span className="text-gray-900 font-medium">Name</span>
              </div>
              <span className="text-gray-500">{user?.name || 'Traveler'}</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Mail size={20} className="text-gray-400 mr-3" />
                <span className="text-gray-900 font-medium">Email</span>
              </div>
              <span className="text-gray-500">{user?.email || 'traveler@example.com'}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Security & Preferences</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center">
                <Lock size={20} className="text-gray-400 mr-3" />
                <span className="text-gray-900 font-medium">Change Password</span>
              </div>
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center">
                <Bell size={20} className="text-gray-400 mr-3" />
                <span className="text-gray-900 font-medium">Notifications</span>
              </div>
            </button>
          </div>
        </section>

        <button 
          onClick={handleSignOut}
          className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-semibold flex items-center justify-center hover:bg-red-100 transition-colors mt-8"
        >
          <LogOut size={20} className="mr-2" />
          Log Out
        </button>
      </div>
    </div>
  );
}
