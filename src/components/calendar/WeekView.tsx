import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useEvents } from '@/contexts/EventsContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import EventDetailsDialog from './EventDetailsDialog';
import type { CalendarEvent } from '@/types/event';

interface WeekViewProps {
  selectedDate: Date;
  onDateTimeClick?: (date: Date, time?: string) => void;
}

const WeekView = ({ selectedDate, onDateTimeClick }: WeekViewProps) => {
  const { events } = useEvents();
  const { language } = useLanguage();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const locale = language === 'es' ? es : enUS;
  const weekStart = startOfWeek(selectedDate, { locale });
  const weekEnd = endOfWeek(selectedDate, { locale });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.startDate, day));
  };

  return (
    <div className="h-full overflow-auto">
      <div className="grid grid-cols-8 border-b sticky top-0 bg-background z-10">
        <div className="p-2"></div>
        {days.map(day => (
          <div key={day.toISOString()} className="p-2 text-center border-l">
            <div className="text-sm font-medium">{format(day, 'EEE', { locale })}</div>
            <div className={`text-lg ${isSameDay(day, new Date()) ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-8 border-b" style={{ minHeight: '60px' }}>
            <div className="p-2 text-xs text-muted-foreground">
              {format(new Date().setHours(hour, 0), 'HH:mm')}
            </div>
            {days.map(day => {
              const dayEvents = getEventsForDay(day).filter(event => {
                const eventHour = parseInt(event.startTime?.split(':')[0] || '0');
                return eventHour === hour;
              });

              return (
                <div 
                  key={day.toISOString()} 
                  className="border-l p-1 relative cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => {
                    if (dayEvents.length === 0 && onDateTimeClick) {
                      const timeString = `${hour.toString().padStart(2, '0')}:00`;
                      onDateTimeClick(day, timeString);
                    }
                  }}
                >
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                      className="text-xs p-2 rounded cursor-pointer mb-1"
                      style={{ backgroundColor: event.color, color: '#fff' }}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
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

export default WeekView;
