import { useLanguage } from '@/contexts/LanguageContext';
import { useEvents } from '@/contexts/EventsContext';
import { cn } from '@/lib/utils';
import { isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, format, getDay } from 'date-fns';

interface YearViewProps {
  selectedDate: Date;
  onDateClick?: (date: Date) => void;
  onYearChange?: (date: Date) => void;
}

const YearView = ({ selectedDate, onDateClick, onYearChange }: YearViewProps) => {
  const { t, language } = useLanguage();
  const { events } = useEvents();
  const year = selectedDate.getFullYear();

  const monthNames = [
    t('january'), t('february'), t('march'), t('april'),
    t('may'), t('june'), t('july'), t('august'),
    t('september'), t('october'), t('november'), t('december')
  ];

  const dayAbbreviations = language === 'es' 
    ? ['D', 'L', 'M', 'M', 'J', 'V', 'S']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const hasEvent = (date: Date) => {
    return events.some(event => isSameDay(new Date(event.startDate), date));
  };

  const renderMonth = (monthIndex: number) => {
    const monthDate = new Date(year, monthIndex, 1);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const firstDayOfWeek = getDay(monthStart);
    const leadingEmptyDays = firstDayOfWeek;

    return (
      <div key={monthIndex} className="bg-card rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-sm font-semibold text-center mb-2 text-primary">
          {monthNames[monthIndex]}
        </h3>
        <div className="grid grid-cols-7 gap-1 text-xs">
          {dayAbbreviations.map((day, idx) => (
            <div key={idx} className="text-center font-medium text-muted-foreground p-1">
              {day}
            </div>
          ))}
          {Array.from({ length: leadingEmptyDays }).map((_, idx) => (
            <div key={`empty-${idx}`} />
          ))}
          {days.map((day) => {
            const hasEvents = hasEvent(day);
            const isToday = isSameDay(day, new Date());
            return (
              <button
                key={day.toString()}
                onClick={() => onDateClick?.(day)}
                className={cn(
                  "aspect-square rounded-md text-center p-1 transition-all hover:bg-accent",
                  isToday && "bg-primary text-primary-foreground font-bold",
                  hasEvents && !isToday && "bg-accent font-semibold",
                  !hasEvents && !isToday && "hover:bg-muted"
                )}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto p-6 bg-gradient-to-br from-background to-secondary/20">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {year}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }, (_, i) => renderMonth(i))}
        </div>
      </div>
    </div>
  );
};

export default YearView;
