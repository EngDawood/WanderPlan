import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Bell, LogOut, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AccountSettings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
        <p className="text-gray-500 mt-2">{t('settings.subtitle')}</p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{t('settings.profile_info')}</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <User size={20} className={`text-gray-400 ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                <span className="text-gray-900 font-medium">{t('settings.name')}</span>
              </div>
              <span className="text-gray-500">{user?.displayName || 'Traveler'}</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Mail size={20} className={`text-gray-400 ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                <span className="text-gray-900 font-medium">{t('settings.email')}</span>
              </div>
              <span className="text-gray-500">{user?.email || 'traveler@example.com'}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{t('settings.security_prefs')}</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
            <button 
              onClick={() => navigate('/settings/change-password')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center">
                <Lock size={20} className={`text-gray-400 ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                <span className="text-gray-900 font-medium">{t('settings.change_password')}</span>
              </div>
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center">
                <Bell size={20} className={`text-gray-400 ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                <span className="text-gray-900 font-medium">{t('settings.notifications')}</span>
              </div>
            </button>
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <Globe size={20} className={`text-gray-400 ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                <span className="text-gray-900 font-medium">{t('settings.language')}</span>
              </div>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
                className="bg-transparent border-none text-gray-500 focus:ring-0 cursor-pointer text-sm font-medium"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </section>

        <button 
          onClick={handleSignOut}
          className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-semibold flex items-center justify-center hover:bg-red-100 transition-colors mt-8"
        >
          <LogOut size={20} className={language === 'ar' ? 'ml-2' : 'mr-2'} />
          {t('settings.logout')}
        </button>
      </div>
    </div>
  );
}
