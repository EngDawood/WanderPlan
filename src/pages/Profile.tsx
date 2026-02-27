import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Heart, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6">
      <div className="flex flex-col items-center mb-8 mt-4">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
          <User size={48} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'Traveler'}</h1>
        <p className="text-gray-500">{user?.email || 'traveler@example.com'}</p>
      </div>

      <div className="space-y-4">
        <ProfileMenuItem 
          icon={<Settings size={24} />} 
          label="Account Settings" 
          onClick={() => navigate('/settings')} 
        />
        <ProfileMenuItem 
          icon={<Heart size={24} />} 
          label="Favorites" 
          onClick={() => navigate('/favorites')} 
        />
        <ProfileMenuItem 
          icon={<Clock size={24} />} 
          label="History" 
          onClick={() => navigate('/history')} 
        />
      </div>
    </div>
  );
}

function ProfileMenuItem({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:border-indigo-100 hover:shadow-md transition-all text-left"
    >
      <div className="flex items-center">
        <div className="bg-gray-50 p-3 rounded-xl mr-4 text-gray-600">
          {icon}
        </div>
        <span className="font-semibold text-gray-900">{label}</span>
      </div>
      <ChevronRight size={20} className="text-gray-300" />
    </button>
  );
}
