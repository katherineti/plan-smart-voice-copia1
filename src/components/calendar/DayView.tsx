import { format, isSameDay } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useEvents } from '@/contexts/EventsContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import EventDetailsDialog from './EventDetailsDialog';
import type { CalendarEvent } from '@/types/event';

interface DayViewProps {
  selectedDate: Date;
  onDateTimeClick?: (date: Date, time?: string) => void;
}

const DayView = ({ selectedDate, onDateTimeClick }: DayViewProps) => {
  const { events } = useEvents();
  const { language } = useLanguage();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const locale = language === 'es' ? es : enUS;

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const dayEvents = events.filter(event => isSameDay(event.startDate, selectedDate));

  const getEventsForHour = (hour: number) => {
    return dayEvents.filter(event => {
      const startHour = parseInt(event.startTime?.split(':')[0] || '0');
      const endHour = parseInt(event.endTime?.split(':')[0] || '0');
      return hour >= startHour && hour < endHour;
    });
  };

  return (
    <div className="h-full overflow-auto p-4">
      <div className="max-w-4xl mx-auto">
        {hours.map(hour => {
          const hourEvents = getEventsForHour(hour);
          
          return (
            <div key={hour} className="flex border-b" style={{ minHeight: '80px' }}>
              <div className="w-20 p-2 text-sm text-muted-foreground">
                {format(new Date().setHours(hour, 0), 'HH:mm')}
              </div>
              <div 
                className="flex-1 p-2 space-y-2 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => {
                  if (hourEvents.length === 0 && onDateTimeClick) {
                    const timeString = `${hour.toString().padStart(2, '0')}:00`;
                    onDateTimeClick(selectedDate, timeString);
                  }
                }}
              >
                {hourEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                    }}
                    className="p-3 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: event.color, color: '#fff' }}
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm opacity-90">
                      {event.startTime} - {event.endTime}
                    </div>
                    {event.location && (
                      <div className="text-sm opacity-90">{event.location}</div>
                    )}
                  </div>
                ))}
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

export default DayView;
