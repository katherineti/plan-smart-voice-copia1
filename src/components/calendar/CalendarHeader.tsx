import { useState } from 'react';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Search, Settings, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import SettingsPanel from './SettingsPanel';
import SearchDialog from './SearchDialog';
import AddEventMenu from './AddEventMenu';

interface CalendarHeaderProps {
  view: 'month' | 'week' | 'day' | 'year' | 'agenda';
  setView: (view: 'month' | 'week' | 'day' | 'year' | 'agenda') => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  onEventSelect?: (eventId: string) => void;
}

const CalendarHeader = ({ view, setView, selectedDate, setSelectedDate, onEventSelect }: CalendarHeaderProps) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  const locale = language === 'es' ? es : enUS;

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (view === 'month') {
      newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  return (
    <header className="border-b bg-card">
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">OronixOS</h1>
          
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user.name || user.email}</span>
              </div>
            )}
            
            <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SettingsPanel />
              </SheetContent>
            </Sheet>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <h2 className="text-lg font-semibold min-w-[200px] text-center">
              {view === 'agenda' 
                ? t('agenda')
                : view === 'year'
                ? format(selectedDate, 'yyyy', { locale })
                : format(selectedDate, view === 'day' ? 'EEEE, d MMMM yyyy' : 'MMMM yyyy', { locale })}
            </h2>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <Button
            onClick={() => setShowAddMenu(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('add')}
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {(['month', 'week', 'day', 'year', 'agenda'] as const).map((v) => (
            <Button
              key={v}
              variant={view === v ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView(v)}
              className="flex-1 min-w-[80px] whitespace-nowrap"
            >
              {t(v)}
            </Button>
          ))}
        </div>
      </div>

      <SearchDialog 
        open={showSearch} 
        onOpenChange={setShowSearch} 
        onEventSelect={onEventSelect}
      />
      <AddEventMenu open={showAddMenu} onOpenChange={setShowAddMenu} />
    </header>
  );
};

export default CalendarHeader;
