import { useState } from 'react';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import MonthView from '@/components/calendar/MonthView';
import WeekView from '@/components/calendar/WeekView';
import DayView from '@/components/calendar/DayView';
import YearView from '@/components/calendar/YearView';
import AgendaView from '@/components/calendar/AgendaView';
import Chatbot from '@/components/chat/Chatbot';
import EventForm from '@/components/calendar/EventForm';
import EventDetailsDialog from '@/components/calendar/EventDetailsDialog';
import { useEvents } from '@/contexts/EventsContext';
import { useNotifications } from '@/hooks/useNotifications';
import type { EventType } from '@/types/event';

type View = 'month' | 'week' | 'day' | 'year' | 'agenda';

const Calendar = () => {
  const { events } = useEvents();
  useNotifications(); // Enable notification system
  const [view, setView] = useState<View>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [eventFormData, setEventFormData] = useState<{
    type: EventType;
    title?: string;
    startDate?: Date;
    startTime?: string;
    endTime?: string;
    location?: string;
  } | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleEventDataCollected = (data: {
    type: EventType;
    title: string;
    startDate: Date;
    startTime: string;
    endTime: string;
    location?: string;
  }) => {
    setEventFormData(data);
    setEventFormOpen(true);
  };

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleDateTimeClick = (date: Date, time?: string) => {
    setEventFormData({
      type: 'event',
      startDate: date,
      startTime: time || '09:00',
      endTime: time ? addHour(time) : '10:00'
    });
    setEventFormOpen(true);
  };

  const addHour = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const newHours = (hours + 1) % 24;
    return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <div className="h-screen flex flex-col bg-background">
      <CalendarHeader 
        view={view}
        setView={setView}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onEventSelect={handleEventSelect}
      />
      
      <div className="flex-1 overflow-hidden">
        {view === 'month' && <MonthView selectedDate={selectedDate} setSelectedDate={setSelectedDate} onDateClick={handleDateTimeClick} />}
        {view === 'week' && <WeekView selectedDate={selectedDate} onDateTimeClick={handleDateTimeClick} />}
        {view === 'day' && <DayView selectedDate={selectedDate} onDateTimeClick={handleDateTimeClick} />}
        {view === 'year' && (
          <YearView 
            selectedDate={selectedDate} 
            onDateClick={handleDateTimeClick}
            onYearChange={setSelectedDate}
          />
        )}
        {view === 'agenda' && <AgendaView onEventClick={handleEventSelect} />}
      </div>
      
{/* se comento el boton de microfono*/}
     {/* <VoiceButton /> */}
      <Chatbot onEventDataCollected={handleEventDataCollected} />
      
      {eventFormData && (
        <EventForm
          type={eventFormData.type}
          open={eventFormOpen}
          onOpenChange={(open) => {
            setEventFormOpen(open);
            if (!open) setEventFormData(null);
          }}
          initialData={eventFormData}
        />
      )}

      {selectedEvent && (
        <EventDetailsDialog
          event={selectedEvent}
          open={!!selectedEventId}
          onOpenChange={(open) => {
            if (!open) setSelectedEventId(null);
          }}
        />
      )}
    </div>
  );
};

export default Calendar;
