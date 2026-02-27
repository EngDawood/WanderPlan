import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Map as MapIcon, List, Home, User } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isHome = location.pathname === '/';
  
  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto shadow-xl overflow-hidden relative">
      {/* Header */}
      {!isHome && (
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center shrink-0 z-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold ml-2 text-gray-900 truncate">
            {getPageTitle(location.pathname)}
          </h1>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 flex items-center justify-around py-2 pb-safe shrink-0">
        <NavItem 
          icon={<Home size={24} />} 
          label="Home" 
          active={location.pathname === '/'} 
          onClick={() => navigate('/')} 
        />
        <NavItem 
          icon={<List size={24} />} 
          label="Saved" 
          active={location.pathname === '/saved'} 
          onClick={() => navigate('/saved')} 
        />
        <NavItem 
          icon={<User size={24} />} 
          label="Profile" 
          active={location.pathname === '/profile'} 
          onClick={() => navigate('/profile')} 
        />
      </nav>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors ${
        active ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
      }`}
    >
      {icon}
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname === '/search') return 'Where to?';
  if (pathname === '/preferences') return 'What do you like?';
  if (pathname === '/places') return 'Select Places';
  if (pathname.startsWith('/place/')) return 'Place Details';
  if (pathname === '/map') return 'Map View';
  if (pathname === '/itinerary') return 'Your Itinerary';
  if (pathname === '/saved') return 'Saved Itineraries';
  if (pathname.startsWith('/saved/')) return 'Saved Itinerary';
  if (pathname === '/profile') return 'Profile';
  if (pathname === '/settings') return 'Account Settings';
  if (pathname === '/favorites') return 'Favorites';
  if (pathname === '/history') return 'History';
  return 'WanderPlan';
}
