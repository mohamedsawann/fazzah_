import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enCreateGame from './locales/en/createGame.json';
import enJoinGame from './locales/en/joinGame.json';
import enRegistration from './locales/en/registration.json';
import enGamePlay from './locales/en/gamePlay.json';
import enResults from './locales/en/results.json';
import enLeaderboard from './locales/en/leaderboard.json';

import arCommon from './locales/ar/common.json';
import arHome from './locales/ar/home.json';
import arCreateGame from './locales/ar/createGame.json';
import arJoinGame from './locales/ar/joinGame.json';
import arRegistration from './locales/ar/registration.json';
import arGamePlay from './locales/ar/gamePlay.json';
import arResults from './locales/ar/results.json';
import arLeaderboard from './locales/ar/leaderboard.json';

const resources = {
  en: {
    common: enCommon,
    home: enHome,
    createGame: enCreateGame,
    joinGame: enJoinGame,
    registration: enRegistration,
    gamePlay: enGamePlay,
    results: enResults,
    leaderboard: enLeaderboard,
  },
  ar: {
    common: arCommon,
    home: arHome,
    createGame: arCreateGame,
    joinGame: arJoinGame,
    registration: arRegistration,
    gamePlay: arGamePlay,
    results: arResults,
    leaderboard: arLeaderboard,
  },
};

// Get saved language or default to Arabic
const getSavedLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('language');
    if (saved && ['ar', 'en'].includes(saved)) {
      return saved;
    }
    
    // Check browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ar')) {
      return 'ar';
    }
    
    return 'ar'; // Default to Arabic
  }
  return 'ar';
};

// Set document direction based on language
export const setDocumentDirection = (lang: string) => {
  if (typeof document !== 'undefined') {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getSavedLanguage(),
    fallbackLng: 'ar',
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    
    ns: ['common', 'home', 'createGame', 'joinGame', 'registration', 'gamePlay', 'results', 'leaderboard'],
    defaultNS: 'common',
  });

// Set initial direction
setDocumentDirection(i18n.language);

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lng);
    setDocumentDirection(lng);
  }
});

export default i18n;