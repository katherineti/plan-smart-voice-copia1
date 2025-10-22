import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEvents } from '@/contexts/EventsContext';
import { format, isAfter, startOfDay } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { Calendar, Clock, MapPin, Tag, SortAsc } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AgendaViewProps {
  onEventClick?: (eventId: string) => void;
}

type SortOption = 'date' | 'alphabetical' | 'recent' | 'title-asc' | 'title-desc';

const AgendaView = ({ onEventClick }: AgendaViewProps) => {
  const { t, language } = useLanguage();
  const { events } = useEvents();
  const [sortOption, setSortOption] = useState<SortOption>('date');

  const locale = language === 'es' ? es : enUS;
  const today = startOfDay(new Date());

  // Filter and sort upcoming events
  let upcomingEvents = events
    .filter(event => isAfter(new Date(event.startDate), today) || 
      format(new Date(event.startDate), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'));

  // Apply sorting
  switch (sortOption) {
    case 'alphabetical':
      upcomingEvents = [...upcomingEvents].sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'title-asc':
      upcomingEvents = [...upcomingEvents].sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'title-desc':
      upcomingEvents = [...upcomingEvents].sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'recent':
      upcomingEvents = [...upcomingEvents]
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .slice(0, 10);
      break;
    case 'date':
    default:
      upcomingEvents = [...upcomingEvents].sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'event':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'task':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'birthday':
        return 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  if (upcomingEvents.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-gradient-to-br from-background to-secondary/20">
        <div className="text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">{t('noEvents')}</h3>
          <p className="text-muted-foreground">{t('add')} {t('event')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 bg-gradient-to-br from-background to-secondary/20">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('upcomingEvents')}
          </h2>
          <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
            <SelectTrigger className="w-[200px]">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">{language === 'es' ? 'Por fecha' : 'By date'}</SelectItem>
              <SelectItem value="alphabetical">{language === 'es' ? 'Alfabético' : 'Alphabetical'}</SelectItem>
              <SelectItem value="title-asc">{language === 'es' ? 'Título (A-Z)' : 'Title (A-Z)'}</SelectItem>
              <SelectItem value="title-desc">{language === 'es' ? 'Título (Z-A)' : 'Title (Z-A)'}</SelectItem>
              <SelectItem value="recent">{language === 'es' ? 'Últimos 10' : 'Last 10'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          {upcomingEvents.map((event) => {
            const eventDate = new Date(event.startDate);
            const dateFormat = language === 'es' 
              ? "d 'de' MMMM, EEEE" 
              : "MMMM d, EEEE";
            
            return (
              <Card
                key={event.id}
                className="p-4 hover:shadow-lg transition-all cursor-pointer border-l-4 hover:scale-[1.02]"
                style={{ borderLeftColor: event.color }}
                onClick={() => onEventClick?.(event.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          {format(eventDate, dateFormat, { locale })}
                        </p>
                        <h3 className="text-xl font-bold mt-1">{event.title}</h3>
                      </div>
                    </div>

                    {event.startTime && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground ml-8">
                        <Clock className="h-4 w-4" />
                        <span>
                          {event.startTime} {event.endTime && `- ${event.endTime}`}
                        </span>
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground ml-8">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {event.description && (
                      <p className="text-sm text-muted-foreground ml-8 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <Badge 
                    variant="outline" 
                    className={`${getEventTypeColor(event.type)} flex items-center gap-1 px-3 py-1`}
                  >
                    <Tag className="h-3 w-3" />
                    {t(event.type)}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AgendaView;
