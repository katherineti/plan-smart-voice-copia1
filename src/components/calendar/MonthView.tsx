import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useEvents } from '@/contexts/EventsContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import EventDetailsDialog from './EventDetailsDialog';
import type { CalendarEvent } from '@/types/event';

interface MonthViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  onDateClick?: (date: Date, time?: string) => void;
}

const MonthView = ({ selectedDate, setSelectedDate, onDateClick }: MonthViewProps) => {
  const { events } = useEvents();
  const { language } = useLanguage();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const locale = language === 'es' ? es : enUS;
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { locale });
  const calendarEnd = endOfWeek(monthEnd, { locale });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = language === 'es' 
    ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.startDate, day));
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="grid grid-cols-7 gap-px bg-border mb-px">
        {weekDays.map(day => (
          <div key={day} className="bg-card p-2 text-center text-sm font-medium">
            {day}
          </div>
        ))}
      </div>
      
      <div className="flex-1 grid grid-cols-7 gap-px bg-border">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={index}
              onClick={() => {
                setSelectedDate(day);
                if (onDateClick && dayEvents.length === 0) {
                  onDateClick(day);
                }
              }}
              className={`bg-card p-2 min-h-[100px] cursor-pointer hover:bg-accent transition-colors ${
                !isCurrentMonth ? 'opacity-50' : ''
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isToday ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' : ''
              }`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                    }}
                    className="text-xs p-1 rounded truncate"
                    style={{ backgroundColor: event.color + '20', borderLeft: `3px solid ${event.color}` }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedEvent && (
        <EventDetailsDialog
          event={selectedEvent}
          open={true}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default MonthView;
