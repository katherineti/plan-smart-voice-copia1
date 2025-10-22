import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEvents } from '@/contexts/EventsContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { X, Plus, Trash2 } from 'lucide-react';
import type { EventType, CalendarEvent, EventNotification } from '@/types/event';

interface EventFormProps {
  type: EventType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent;
  initialData?: {
    title?: string;
    startDate?: Date;
    startTime?: string;
    endTime?: string;
    location?: string;
  };
}

const EVENT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

const EventForm = ({ type, open, onOpenChange, event, initialData }: EventFormProps) => {
  const { addEvent, updateEvent } = useEvents();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || event?.title || '',
    description: event?.description || '',
    location: initialData?.location || event?.location || '',
    color: event?.color || EVENT_COLORS[0],
    startDate: initialData?.startDate || event?.startDate || new Date(),
    endDate: event?.endDate || new Date(),
    startTime: initialData?.startTime || event?.startTime || '09:00',
    endTime: initialData?.endTime || event?.endTime || '10:00',
  });

  const [notifications, setNotifications] = useState<EventNotification[]>(
    event?.notifications || []
  );

  // Update form data when initialData changes (from chatbot)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        title: initialData.title || prev.title,
        startDate: initialData.startDate || prev.startDate,
        startTime: initialData.startTime || prev.startTime,
        endTime: initialData.endTime || prev.endTime,
        location: initialData.location || prev.location,
      }));
    }
  }, [initialData]);

  const addNotification = () => {
    setNotifications([...notifications, { type: 'push', minutesBefore: 15 }]);
  };

  const removeNotification = (index: number) => {
    setNotifications(notifications.filter((_, i) => i !== index));
  };

  const updateNotification = (index: number, field: 'minutesBefore', value: number) => {
    setNotifications(notifications.map((notif, i) => 
      i === index ? { ...notif, [field]: value } : notif
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData = {
      ...formData,
      type,
      notifications,
      userId: user?.id || '1'
    };

    if (event) {
      updateEvent(event.id, eventData);
    } else {
      addEvent(eventData);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? t('edit') : t('add')} {t(type)}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('title')}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('location')}</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">{t('date')}</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate instanceof Date 
                ? formData.startDate.toISOString().split('T')[0] 
                : formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">{t('startTime')}</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">{t('endTime')}</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('color')}</Label>
            <div className="flex gap-2">
              {EVENT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="w-8 h-8 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: color,
                    borderColor: formData.color === color ? '#000' : 'transparent',
                    transform: formData.color === color ? 'scale(1.1)' : 'scale(1)'
                  }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('notifications')}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addNotification}>
                <Plus className="h-4 w-4 mr-1" />
                {t('add')}
              </Button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay notificaciones programadas</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={notification.minutesBefore.toString()}
                      onValueChange={(value) => updateNotification(index, 'minutesBefore', parseInt(value))}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 {t('minutesBefore')}</SelectItem>
                        <SelectItem value="15">15 {t('minutesBefore')}</SelectItem>
                        <SelectItem value="30">30 {t('minutesBefore')}</SelectItem>
                        <SelectItem value="60">1 hora antes</SelectItem>
                        <SelectItem value="120">2 horas antes</SelectItem>
                        <SelectItem value="1440">1 día antes</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeNotification(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {t('cancel')}
            </Button>
            <Button type="submit" className="flex-1">
              {t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventForm;
