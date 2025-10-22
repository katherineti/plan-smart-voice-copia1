import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en' | 'fr' | 'de' | 'pt';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  es: {
    welcome: 'Bienvenido a Planificador Virtual',
    signInGoogle: 'Iniciar sesión con Google',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    year: 'Año',
    agenda: 'Agenda',
    event: 'Evento',
    task: 'Tarea',
    birthday: 'Cumpleaños',
    add: 'Agregar',
    edit: 'Editar',
    delete: 'Eliminar',
    duplicate: 'Duplicar',
    save: 'Guardar',
    cancel: 'Cancelar',
    search: 'Buscar',
    settings: 'Configuración',
    theme: 'Tema',
    language: 'Idioma',
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Predeterminado',
    title: 'Título',
    description: 'Descripción',
    location: 'Ubicación',
    color: 'Color',
    notifications: 'Notificaciones',
    addNotification: 'Agregar notificación',
    minutesBefore: 'Minutos antes',
    date: 'Fecha',
    startDate: 'Fecha de inicio',
    endDate: 'Fecha de fin',
    startTime: 'Hora de inicio',
    endTime: 'Hora de fin',
    noEvents: 'No hay eventos programados',
    upcomingEvents: 'Eventos próximos',
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
    january: 'Enero',
    february: 'Febrero',
    march: 'Marzo',
    april: 'Abril',
    may: 'Mayo',
    june: 'Junio',
    july: 'Julio',
    august: 'Agosto',
    september: 'Septiembre',
    october: 'Octubre',
    november: 'Noviembre',
    december: 'Diciembre'
  },
  en: {
    welcome: 'Welcome to Virtual Planner',
    signInGoogle: 'Sign in with Google',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    year: 'Year',
    agenda: 'Agenda',
    event: 'Event',
    task: 'Task',
    birthday: 'Birthday',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    duplicate: 'Duplicate',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    settings: 'Settings',
    theme: 'Theme',
    language: 'Language',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    title: 'Title',
    description: 'Description',
    location: 'Location',
    color: 'Color',
    notifications: 'Notifications',
    addNotification: 'Add notification',
    minutesBefore: 'Minutes before',
    date: 'Date',
    startDate: 'Start Date',
    endDate: 'End Date',
    startTime: 'Start Time',
    endTime: 'End Time',
    noEvents: 'No scheduled events',
    upcomingEvents: 'Upcoming events',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  useEffect(() => {
    const stored = localStorage.getItem('language') as Language;
    if (stored) setLanguage(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
