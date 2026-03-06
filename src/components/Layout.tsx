import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Map as MapIcon, List, Home, Settings } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  
  const isHome = location.pathname === '/';
  
  const getPageTitle = (pathname: string): string => {
    if (pathname === '/search') return t('title.search');
    if (pathname === '/preferences') return t('title.preferences');
    if (pathname === '/places') return t('title.places');
    if (pathname.startsWith('/place/')) return t('title.place_details');
    if (pathname === '/map') return t('title.map');
    if (pathname === '/itinerary') return t('title.itinerary');
    if (pathname === '/saved') return t('title.saved');
    if (pathname.startsWith('/saved/')) return t('title.saved_detail');
    if (pathname === '/profile') return t('title.profile');
    if (pathname === '/settings') return t('title.settings');
    if (pathname === '/favorites') return t('title.favorites');
    if (pathname === '/history') return t('title.history');
    return t('title.default');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto shadow-xl overflow-hidden relative">
      {/* Header */}
      {!isHome && (
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center shrink-0 z-10">
          <button 
            onClick={() => navigate(-1)}
            className={`p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors ${language === 'ar' ? '-mr-2' : '-ml-2'}`}
          >
            <ArrowLeft size={20} className={language === 'ar' ? 'rotate-180' : ''} />
          </button>
          <h1 className={`text-lg font-semibold text-gray-900 truncate ${language === 'ar' ? 'mr-2' : 'ml-2'}`}>
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
          label={t('nav.home')} 
          active={location.pathname === '/'} 
          onClick={() => navigate('/')} 
        />
        <NavItem 
          icon={<List size={24} />} 
          label={t('nav.saved')} 
          active={location.pathname === '/saved'} 
          onClick={() => navigate('/saved')} 
        />
        <NavItem 
          icon={<Settings size={24} />} 
          label={t('nav.settings')} 
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
