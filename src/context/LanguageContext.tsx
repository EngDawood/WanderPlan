import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.saved': 'Saved',
    'nav.settings': 'Settings',
    
    // Layout Titles
    'title.search': 'Where to?',
    'title.preferences': 'What do you like?',
    'title.places': 'Select Places',
    'title.place_details': 'Place Details',
    'title.map': 'Map View',
    'title.itinerary': 'Your Itinerary',
    'title.saved': 'Saved Itineraries',
    'title.saved_detail': 'Saved Itinerary',
    'title.profile': 'Settings',
    'title.settings': 'Account Settings',
    'title.favorites': 'Favorites',
    'title.history': 'History',
    'title.default': 'WanderPlan',

    // Home
    'home.title': 'WanderPlan',
    'home.subtitle': 'Your personal travel itinerary generator.',
    'home.plan_new_trip': 'Plan a New Trip',
    'home.recent_trips': 'Recent Trips',
    'home.see_all': 'See all',
    'home.no_saved': 'No saved itineraries yet.',
    'home.plan_to_see': 'Plan a trip to see it here.',

    // City Search
    'search.title': 'Where are you going?',
    'search.subtitle': 'Search for a city to start planning.',
    'search.placeholder': 'e.g. Paris, Tokyo, New York',
    'search.recent': 'Recent Searches',
    'search.popular': 'Popular Destinations',
    'profile.favorites': 'Favorites',
    'profile.history': 'History',

    // Settings
    'settings.title': 'Account Settings',
    'settings.subtitle': 'Manage your account details and preferences.',
    'settings.profile_info': 'Profile Information',
    'settings.name': 'Name',
    'settings.email': 'Email',
    'settings.security_prefs': 'Security & Preferences',
    'settings.change_password': 'Change Password',
    'settings.notifications': 'Notifications',
    'settings.language': 'Language',
    'settings.logout': 'Log Out',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.saved': 'المحفوظات',
    'nav.settings': 'الإعدادات',

    // Layout Titles
    'title.search': 'إلى أين؟',
    'title.preferences': 'ماذا تحب؟',
    'title.places': 'اختر الأماكن',
    'title.place_details': 'تفاصيل المكان',
    'title.map': 'عرض الخريطة',
    'title.itinerary': 'مسار رحلتك',
    'title.saved': 'الرحلات المحفوظة',
    'title.saved_detail': 'الرحلة المحفوظة',
    'title.profile': 'الإعدادات',
    'title.settings': 'إعدادات الحساب',
    'title.favorites': 'المفضلة',
    'title.history': 'السجل',
    'title.default': 'واندر بلان',

    // Home
    'home.title': 'واندر بلان',
    'home.subtitle': 'مولد مسار رحلتك الشخصي.',
    'home.plan_new_trip': 'خطط لرحلة جديدة',
    'home.recent_trips': 'الرحلات الأخيرة',
    'home.see_all': 'عرض الكل',
    'home.no_saved': 'لا توجد رحلات محفوظة بعد.',
    'home.plan_to_see': 'خطط لرحلة لرؤيتها هنا.',

    // City Search
    'search.title': 'إلى أين أنت ذاهب؟',
    'search.subtitle': 'ابحث عن مدينة لبدء التخطيط.',
    'search.placeholder': 'مثل باريس، طوكيو، نيويورك',
    'search.recent': 'عمليات البحث الأخيرة',
    'search.popular': 'وجهات شهيرة',
    'profile.favorites': 'المفضلة',
    'profile.history': 'السجل',

    // Settings
    'settings.title': 'إعدادات الحساب',
    'settings.subtitle': 'إدارة تفاصيل حسابك وتفضيلاتك.',
    'settings.profile_info': 'معلومات الملف الشخصي',
    'settings.name': 'الاسم',
    'settings.email': 'البريد الإلكتروني',
    'settings.security_prefs': 'الأمان والتفضيلات',
    'settings.change_password': 'تغيير كلمة المرور',
    'settings.notifications': 'الإشعارات',
    'settings.language': 'اللغة',
    'settings.logout': 'تسجيل الخروج',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
