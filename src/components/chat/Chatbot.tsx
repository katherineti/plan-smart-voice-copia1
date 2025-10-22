import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Mic, MicOff, X, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useEvents } from '@/contexts/EventsContext';
import { format, parse, addDays, isSameDay, startOfDay } from 'date-fns';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

interface ChatbotProps {
  onEventDataCollected: (data: {
    type: 'event' | 'task' | 'birthday';
    title: string;
    startDate: Date;
    startTime: string;
    endTime: string;
    location?: string;
  }) => void;
}

const Chatbot = ({ onEventDataCollected }: ChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const { events, updateEvent, addEvent } = useEvents();
  const [conversationState, setConversationState] = useState<{
    step: 'greeting' | 'type' | 'title' | 'date' | 'startTime' | 'endTime' | 'location' | 'complete' | 
          'organize_day' | 'move_event_search' | 'move_event_confirm' | 'reminder_setup' | 'organize_week' |
          'edit_time_search' | 'edit_time_input' | 'edit_title_search' | 'edit_title_input' |
          'edit_location_search' | 'edit_location_input' | 'ask_continue' | 'reminder_element' | 'reminder_time';
    type?: 'event' | 'task' | 'birthday';
    title?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    targetDate?: string;
    foundEvent?: any;
    reminderDate?: string;
    editField?: string;
  }>({ step: 'greeting' });
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationStateRef = useRef(conversationState);

  useEffect(() => {
    conversationStateRef.current = conversationState;
  }, [conversationState]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'es-ES';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        addUserMessage(transcript);
        processUserInputWithState(transcript);
        setInputText('');
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = '¡Hola! Soy tu asistente de OronixOS. Puedo ayudarte a:\n\n' +
        '• Crear eventos, tareas o cumpleaños\n' +
        '• Ordenar tu día automáticamente\n' +
        '• Mover eventos a otras fechas\n' +
        '• Agregar recordatorios\n' +
        '• Organizar tu semana\n' +
        '• Editar títulos, horas y ubicaciones\n' +
        '• Ordenar alfabéticamente\n\n' +
        '¿Qué te gustaría hacer?';
      speak('¡Hola! Soy tu asistente de OronixOS.');
      addBotMessage(greeting);
    }
  }, [isOpen]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const addBotMessage = (content: string) => {
    setMessages(prev => [...prev, { role: 'bot', content }]);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, { role: 'user', content }]);
  };

  const askToContinue = () => {
    const msg = '¿Deseas realizar otra acción?';
    speak(msg);
    addBotMessage(msg);
    setConversationState({ step: 'ask_continue' });
  };

  const processUserInputWithState = (input: string) => {
    const currentState = conversationStateRef.current;
    const lowerInput = input.toLowerCase();

    // Handle continue question
    if (currentState.step === 'ask_continue') {
      if (lowerInput.includes('si') || lowerInput.includes('sí')) {
        const msg = '¿Qué te gustaría hacer?\n\n' +
          '• Crear evento/tarea/cumpleaños\n' +
          '• Ordenar día\n' +
          '• Ordenar semana\n' +
          '• Mover evento\n' +
          '• Agregar recordatorio\n' +
          '• Editar título/hora/ubicación\n' +
          '• Ordenar alfabéticamente';
        speak('¿Qué te gustaría hacer?');
        addBotMessage(msg);
        setConversationState({ step: 'greeting' });
        return;
      } else {
        const msg = '¡Perfecto! Aquí estaré si me necesitas.';
        speak(msg);
        addBotMessage(msg);
        setConversationState({ step: 'greeting' });
        return;
      }
    }

    // Check for special commands first
    if (lowerInput.includes('ordenar') && (lowerInput.includes('día') || lowerInput.includes('dia'))) {
      handleOrganizeDay();
      return;
    }

    if (lowerInput.includes('ordenar') && lowerInput.includes('semana')) {
      handleOrganizeWeek();
      return;
    }

    if (lowerInput.includes('ordenar') && (lowerInput.includes('alfabético') || lowerInput.includes('alfabetico'))) {
      handleAlphabeticalSort();
      return;
    }

    if (lowerInput.includes('mover') || lowerInput.includes('cambiar')) {
      handleMoveEvent(input);
      return;
    }

    if (lowerInput.includes('recuerda') || lowerInput.includes('recordatorio')) {
      if (currentState.step === 'reminder_element') {
        handleReminderElement(input);
        return;
      } else if (currentState.step === 'reminder_time') {
        handleReminderTime(input);
        return;
      } else {
        handleReminder(input);
        return;
      }
    }

    if (lowerInput.includes('modificar') || lowerInput.includes('editar')) {
      if (lowerInput.includes('hora')) {
        handleEditTime(input);
        return;
      } else if (lowerInput.includes('titulo') || lowerInput.includes('título')) {
        handleEditTitle(input);
        return;
      } else if (lowerInput.includes('ubicacion') || lowerInput.includes('ubicación')) {
        handleEditLocation(input);
        return;
      }
    }

    // Handle edit flows
    if (currentState.step === 'edit_time_input') {
      handleEditTimeInput(input);
      return;
    }

    if (currentState.step === 'edit_title_input') {
      handleEditTitleInput(input);
      return;
    }

    if (currentState.step === 'edit_location_input') {
      handleEditLocationInput(input);
      return;
    }

    switch (currentState.step) {
      case 'greeting':
      case 'type':
        if (lowerInput.includes('evento')) {
          setConversationState({ ...currentState, step: 'title', type: 'event' });
          const msg = '¡Perfecto! Vamos a crear un evento. ¿Cuál es el título del evento?';
          speak(msg);
          addBotMessage(msg);
        } else if (lowerInput.includes('tarea')) {
          setConversationState({ ...currentState, step: 'title', type: 'task' });
          const msg = '¡Genial! Vamos a crear una tarea. ¿Cuál es el título de la tarea?';
          speak(msg);
          addBotMessage(msg);
        } else if (lowerInput.includes('cumpleaño')) {
          setConversationState({ ...currentState, step: 'title', type: 'birthday' });
          const msg = '¡Excelente! Vamos a crear un cumpleaños. ¿De quién es el cumpleaños?';
          speak(msg);
          addBotMessage(msg);
        } else {
          const msg = 'Por favor, dime qué quieres hacer: crear evento/tarea/cumpleaños, ordenar tu día/semana, mover un evento, o agregar recordatorios.';
          speak(msg);
          addBotMessage(msg);
        }
        break;

      case 'title':
        setConversationState({ ...currentState, step: 'date', title: input });
        const msgDate = '¿Para qué fecha? Dime la fecha en formato día/mes/año, "para el día 25", "para el 12", o solo el día si es para este mes.';
        speak(msgDate);
        addBotMessage(msgDate);
        break;

      case 'date':
        const parsedDate = parseDate(input);
        if (parsedDate) {
          setConversationState({ ...currentState, step: 'startTime', date: parsedDate });
          const msgStart = '¿A qué hora inicia? Por ejemplo: 9:00 o 14:30';
          speak(msgStart);
          addBotMessage(msgStart);
        } else {
          const msgError = 'No entendí la fecha. Por favor, dímela de nuevo.';
          speak(msgError);
          addBotMessage(msgError);
        }
        break;

      case 'startTime':
        const startTime = parseTime(input);
        if (startTime) {
          setConversationState({ ...currentState, step: 'endTime', startTime });
          const msgEnd = '¿A qué hora termina? Por ejemplo: 10:00 o 16:30';
          speak(msgEnd);
          addBotMessage(msgEnd);
        } else {
          const msgError = 'No entendí la hora. Por favor, dímela de nuevo en formato HH:MM';
          speak(msgError);
          addBotMessage(msgError);
        }
        break;

      case 'endTime':
        const endTime = parseTime(input);
        if (endTime) {
          setConversationState({ ...currentState, step: 'location', endTime });
          const msgLocation = '¿Dónde será? Puedes decirme la ubicación o simplemente di "sin ubicación" o "saltar".';
          speak(msgLocation);
          addBotMessage(msgLocation);
        } else {
          const msgError = 'No entendí la hora. Por favor, dímela de nuevo en formato HH:MM';
          speak(msgError);
          addBotMessage(msgError);
        }
        break;

      case 'location':
        let location: string | undefined = undefined;
        if (!lowerInput.includes('sin') && !lowerInput.includes('saltar') && !lowerInput.includes('no')) {
          location = input;
        }
        
        setConversationState({ ...currentState, step: 'complete', location });
        const msgComplete = '¡Perfecto! Tengo toda la información. Voy a abrir el formulario para que puedas revisar y guardar.';
        speak(msgComplete);
        addBotMessage(msgComplete);

        setTimeout(() => {
          const currentStateData = conversationStateRef.current;
          const [year, month, day] = currentStateData.date!.split('-').map(Number);
          const localDate = new Date(year, month - 1, day);
          
          const eventData = {
            type: currentStateData.type!,
            title: currentStateData.title!,
            startDate: localDate,
            startTime: currentStateData.startTime!,
            endTime: currentStateData.endTime!,
            location: location
          };
          onEventDataCollected(eventData);
          setIsOpen(false);
          resetConversation();
        }, 2000);
        break;
    }
  };

  const parseDate = (input: string): string | null => {
    const today = new Date();
    const lowerInput = input.toLowerCase();
    
    // Handle "para el día X" or "para el X"
    const dayOnlyMatch = lowerInput.match(/(?:para\s+el\s+(?:día|dia)\s+)?(\d{1,2})(?!\/)/) || 
                         lowerInput.match(/para\s+el\s+(\d{1,2})/);
    if (dayOnlyMatch) {
      const day = parseInt(dayOnlyMatch[1]);
      if (day >= 1 && day <= 31) {
        return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }
    }

    // Standard date patterns
    const fullDateMatch = input.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    const shortDateMatch = input.match(/(\d{1,2})\/(\d{1,2})/);

    if (fullDateMatch) {
      return `${fullDateMatch[3]}-${fullDateMatch[2].padStart(2, '0')}-${fullDateMatch[1].padStart(2, '0')}`;
    } else if (shortDateMatch) {
      return `${today.getFullYear()}-${shortDateMatch[2].padStart(2, '0')}-${shortDateMatch[1].padStart(2, '0')}`;
    }

    if (lowerInput.includes('hoy')) {
      return today.toISOString().split('T')[0];
    } else if (lowerInput.includes('mañana')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }

    return null;
  };

  const parseTime = (input: string): string | null => {
    const timeMatch = input.match(/(\d{1,2}):?(\d{2})?/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }
    return null;
  };

  const handleOrganizeDay = () => {
    const today = startOfDay(new Date());
    const todayEvents = events.filter(e => isSameDay(new Date(e.startDate), today));

    if (todayEvents.length === 0) {
      const msg = 'No tienes eventos programados para hoy.';
      speak(msg);
      addBotMessage(msg);
      askToContinue();
      return;
    }

    const msg = `Encontré ${todayEvents.length} eventos para hoy:\n\n${todayEvents.map(e => 
      `• ${e.title} - ${e.startTime || 'Sin hora'}`
    ).join('\n')}\n\n¿Quieres que los ordene por prioridad, por hora, o por duración?`;
    speak('Encontré varios eventos para hoy');
    addBotMessage(msg);
    setConversationState({ step: 'organize_day' });
  };

  const handleOrganizeWeek = () => {
    const today = startOfDay(new Date());
    const weekEvents = events.filter(e => {
      const eventDate = new Date(e.startDate);
      const diffDays = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays < 7;
    });

    if (weekEvents.length === 0) {
      const msg = 'No tienes eventos programados para esta semana.';
      speak(msg);
      addBotMessage(msg);
      askToContinue();
      return;
    }

    const sorted = weekEvents.sort((a, b) => {
      const dateCompare = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      if (dateCompare !== 0) return dateCompare;
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      return 0;
    });

    const msg = `He organizado ${sorted.length} eventos de tu semana:\n\n${sorted.map((e, i) => 
      `${i + 1}. ${format(new Date(e.startDate), 'EEEE d')} - ${e.title} ${e.startTime ? `a las ${e.startTime}` : ''}`
    ).join('\n')}\n\n✅ Tu semana está organizada cronológicamente.`;
    speak('He organizado tu semana');
    addBotMessage(msg);
    askToContinue();
  };

  const handleAlphabeticalSort = () => {
    const sortedEvents = [...events].sort((a, b) => a.title.localeCompare(b.title));
    const msg = `He ordenado alfabéticamente ${sortedEvents.length} elementos:\n\n${sortedEvents.slice(0, 10).map((e, i) => 
      `${i + 1}. ${e.title} - ${format(new Date(e.startDate), 'dd/MM/yyyy')}`
    ).join('\n')}\n\n✅ Calendario ordenado alfabéticamente.`;
    speak('He ordenado los eventos alfabéticamente');
    addBotMessage(msg);
    askToContinue();
  };

  const handleMoveEvent = (input: string) => {
    const titleMatch = input.match(/(?:evento|tarea|cumpleaños)[:\s]+['"]?([^'"]+?)['"]?\s+(?:a|al|para)/i) ||
                      input.match(/['"]([^'"]+)['"]\s+(?:a|al|para)/);
    
    if (!titleMatch) {
      const msg = 'No pude identificar el evento. Por favor, dime: "Mover evento [nombre] a [fecha]"';
      speak(msg);
      addBotMessage(msg);
      return;
    }

    const title = titleMatch[1].trim();
    const foundEvent = events.find(e => 
      e.title.toLowerCase().includes(title.toLowerCase())
    );

    if (!foundEvent) {
      const msg = `No encontré ningún evento con el título "${title}". ¿Puedes verificar el nombre?`;
      speak(msg);
      addBotMessage(msg);
      return;
    }

    let targetDate: Date | null = null;
    
    if (input.toLowerCase().includes('mañana')) {
      targetDate = addDays(new Date(), 1);
    } else {
      const dateMatch = input.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})|dia\s+(\d{1,2})/i);
      if (dateMatch) {
        if (dateMatch[4]) {
          const today = new Date();
          targetDate = new Date(today.getFullYear(), today.getMonth(), parseInt(dateMatch[4]));
        } else if (dateMatch[1] && dateMatch[2] && dateMatch[3]) {
          targetDate = new Date(parseInt(dateMatch[3]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[1]));
        }
      }
    }

    if (!targetDate) {
      const msg = 'No pude entender la fecha. Intenta con "mañana", "día 24" o "01/11/2025"';
      speak(msg);
      addBotMessage(msg);
      return;
    }

    updateEvent(foundEvent.id, { startDate: targetDate, endDate: targetDate });
    
    const msg = `✅ ¡Hecho! He movido:\n\n` +
                `📌 ${foundEvent.title}\n` +
                `🏷️ Tipo: ${foundEvent.type}\n` +
                `📅 Fecha anterior: ${format(new Date(foundEvent.startDate), 'dd/MM/yyyy')}\n` +
                `📅 Nueva fecha: ${format(targetDate, 'dd/MM/yyyy')}`;
    speak('He movido el evento exitosamente');
    addBotMessage(msg);
    askToContinue();
  };

  const handleReminder = (input: string) => {
    const dateMatch = input.match(/(\d{1,2})\s+de\s+(\w+)|(\d{1,2})\/(\d{1,2})\/(\d{4})/i);
    
    if (dateMatch) {
      let targetDate: Date;
      
      if (dateMatch[3] && dateMatch[4] && dateMatch[5]) {
        targetDate = new Date(parseInt(dateMatch[5]), parseInt(dateMatch[4]) - 1, parseInt(dateMatch[3]));
      } else {
        const day = parseInt(dateMatch[1]);
        const month = dateMatch[2].toLowerCase();
        const monthMap: {[key: string]: number} = {
          enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
          julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
        };
        const monthNum = monthMap[month] ?? new Date().getMonth();
        targetDate = new Date(new Date().getFullYear(), monthNum, day);
      }

      const dayEvents = events.filter(e => isSameDay(new Date(e.startDate), targetDate));
      
      if (dayEvents.length === 0) {
        const msg = `No tienes eventos programados para el ${format(targetDate, 'dd/MM/yyyy')}`;
        speak(msg);
        addBotMessage(msg);
        askToContinue();
        return;
      }

      dayEvents.forEach(event => {
        const updatedNotifications = [
          ...event.notifications,
          { type: 'push' as const, minutesBefore: 480 }
        ];
        updateEvent(event.id, { notifications: updatedNotifications });
      });

      const msg = `✅ ¡Está hecho! He agregado recordatorios a las 8:00 AM para:\n\n${dayEvents.map((e, i) => 
        `${i + 1}. ${e.title} - ${e.startTime || 'Sin hora'}`
      ).join('\n')}`;
      speak('He agregado los recordatorios');
      addBotMessage(msg);
      askToContinue();
    } else {
      const msg = '¿Para qué elemento deseas agregar el recordatorio? Dime el título.';
      speak(msg);
      addBotMessage(msg);
      setConversationState({ step: 'reminder_element' });
    }
  };

  const handleReminderElement = (input: string) => {
    const foundEvent = events.find(e => 
      e.title.toLowerCase().includes(input.toLowerCase())
    );

    if (!foundEvent) {
      const msg = `No encontré ningún elemento con el título "${input}". ¿Puedes verificar el nombre?`;
      speak(msg);
      addBotMessage(msg);
      return;
    }

    const currentNotification = foundEvent.notifications.length > 0 
      ? `${foundEvent.notifications[0].minutesBefore} minutos antes`
      : 'Sin recordatorio';

    const msg = `Encontré:\n\n` +
                `📌 ${foundEvent.title}\n` +
                `📅 Fecha: ${format(new Date(foundEvent.startDate), 'dd/MM/yyyy')}\n` +
                `🔔 Recordatorio actual: ${currentNotification}\n\n` +
                `¿A cuántos minutos antes deseas el recordatorio? (ejemplo: 5, 30, 60)`;
    speak('Encontré el elemento');
    addBotMessage(msg);
    setConversationState({ step: 'reminder_time', foundEvent });
  };

  const handleReminderTime = (input: string) => {
    const minutes = parseInt(input);
    if (isNaN(minutes) || minutes < 0) {
      const msg = 'Por favor, dime un número válido de minutos.';
      speak(msg);
      addBotMessage(msg);
      return;
    }

    const currentState = conversationStateRef.current;
    const event = currentState.foundEvent;
    
    if (!event) return;

    const updatedNotifications = [
      { type: 'push' as const, minutesBefore: minutes }
    ];
    updateEvent(event.id, { notifications: updatedNotifications });

    const msg = `✅ ¡Está hecho! Se ha agregado la notificación:\n\n` +
                `📌 ${event.title}\n` +
                `📅 Fecha: ${format(new Date(event.startDate), 'dd/MM/yyyy')}\n` +
                `⏰ Hora: ${event.startTime || 'Sin hora'}\n` +
                `🔔 Recordatorio: ${minutes} minutos antes`;
    speak('He agregado el recordatorio');
    addBotMessage(msg);
    askToContinue();
  };

  const handleEditTime = (input: string) => {
    const titleMatch = input.match(/(?:hora\s+del?|hora\s+de\s+la?)\s+(.+?)(?:\s+a\s+|\s*$)/i);
    
    if (!titleMatch) {
      const msg = 'No pude identificar el evento. Por favor, dime: "Modificar hora del [nombre del evento]"';
      speak(msg);
      addBotMessage(msg);
      return;
    }

    const title = titleMatch[1].trim();
    const foundEvent = events.find(e => 
      e.title.toLowerCase().includes(title.toLowerCase())
    );

    if (!foundEvent) {
      const msg = `No encontré ningún elemento con "${title}". ¿Puedes verificar el nombre?`;
      speak(msg);
      addBotMessage(msg);
      return;
    }

    const msg = `Encontré:\n\n` +
                `📌 ${foundEvent.title}\n` +
                `🏷️ Tipo: ${foundEvent.type}\n` +
                `📅 Fecha: ${format(new Date(foundEvent.startDate), 'dd/MM/yyyy')}\n` +
                `⏰ Hora actual: ${foundEvent.startTime || 'Sin hora'}\n\n` +
                `¿A qué hora deseas el elemento? (ejemplo: 14:30)`;
    speak('Encontré el elemento');
    addBotMessage(msg);
    setConversationState({ step: 'edit_time_input', foundEvent });
  };

  const handleEditTimeInput = (input: string) => {
    const newTime = parseTime(input);
    if (!newTime) {
      const msg = 'No entendí la hora. Por favor, dímela de nuevo en formato HH:MM';
      speak(msg);
      addBotMessage(msg);
      return;
    }

    const currentState = conversationStateRef.current;
    const event = currentState.foundEvent;
    
    if (!event) return;

    updateEvent(event.id, { startTime: newTime });

    const msg = `✅ ¡Hecho! He modificado:\n\n` +
                `📌 ${event.title}\n` +
                `🏷️ Tipo: ${event.type}\n` +
                `📅 Fecha: ${format(new Date(event.startDate), 'dd/MM/yyyy')}\n` +
                `⏰ Nueva hora: ${newTime}`;
    speak('He modificado la hora');
    addBotMessage(msg);
    askToContinue();
  };

  const handleEditTitle = (input: string) => {
    const titleMatch = input.match(/(?:título|titulo)\s+(?:del?|de\s+la?)\s+(.+?)(?:\s*$)/i);
    
    if (!titleMatch) {
      const msg = 'No pude identificar el evento. Por favor, dime: "Modificar título del [nombre del evento]"';
      speak(msg);
      addBotMessage(msg);
      return;
    }

    const title = titleMatch[1].trim();
    const foundEvent = events.find(e => 
      e.title.toLowerCase().includes(title.toLowerCase())
    );

    if (!foundEvent) {
      const msg = `No encontré ningún elemento con "${title}". ¿Puedes verificar el nombre?`;
      speak(msg);
      addBotMessage(msg);
      return;
    }

    const msg = `Encontré:\n\n` +
                `📌 ${foundEvent.title}\n` +
                `🏷️ Tipo: ${foundEvent.type}\n` +
                `📅 Fecha: ${format(new Date(foundEvent.startDate), 'dd/MM/yyyy')}\n` +
                `⏰ Hora: ${foundEvent.startTime || 'Sin hora'}\n\n` +
                `¿Qué título deseas agregarle?`;
    speak('Encontré el elemento');
    addBotMessage(msg);
    setConversationState({ step: 'edit_title_input', foundEvent });
  };

  const handleEditTitleInput = (input: string) => {
    const currentState = conversationStateRef.current;
    const event = currentState.foundEvent;
    
    if (!event) return;

    updateEvent(event.id, { title: input });

    const msg = `✅ ¡Hecho! He modificado:\n\n` +
                `📌 Nuevo título: ${input}\n` +
                `🏷️ Tipo: ${event.type}\n` +
                `📅 Fecha: ${format(new Date(event.startDate), 'dd/MM/yyyy')}\n` +
                `⏰ Hora: ${event.startTime || 'Sin hora'}`;
    speak('He modificado el título');
    addBotMessage(msg);
    askToContinue();
  };

  const handleEditLocation = (input: string) => {
    const titleMatch = input.match(/(?:ubicación|ubicacion)\s+(?:del?|de\s+la?)\s+(.+?)(?:\s*$)/i);
    
    if (!titleMatch) {
      const msg = 'No pude identificar el evento. Por favor, dime: "Modificar ubicación del [nombre del evento]"';
      speak(msg);
      addBotMessage(msg);
      return;
    }

    const title = titleMatch[1].trim();
    const foundEvent = events.find(e => 
      e.title.toLowerCase().includes(title.toLowerCase())
    );

    if (!foundEvent) {
      const msg = `No encontré ningún elemento con "${title}". ¿Puedes verificar el nombre?`;
      speak(msg);
      addBotMessage(msg);
      return;
    }

    const msg = `Encontré:\n\n` +
                `📌 ${foundEvent.title}\n` +
                `🏷️ Tipo: ${foundEvent.type}\n` +
                `📅 Fecha: ${format(new Date(foundEvent.startDate), 'dd/MM/yyyy')}\n` +
                `⏰ Hora: ${foundEvent.startTime || 'Sin hora'}\n` +
                `📍 Ubicación actual: ${foundEvent.location || 'Sin ubicación'}\n\n` +
                `¿Qué ubicación deseas agregar al elemento?`;
    speak('Encontré el elemento');
    addBotMessage(msg);
    setConversationState({ step: 'edit_location_input', foundEvent });
  };

  const handleEditLocationInput = (input: string) => {
    const currentState = conversationStateRef.current;
    const event = currentState.foundEvent;
    
    if (!event) return;

    updateEvent(event.id, { location: input });

    const msg = `✅ ¡Hecho! He modificado:\n\n` +
                `📌 ${event.title}\n` +
                `🏷️ Tipo: ${event.type}\n` +
                `📅 Fecha: ${format(new Date(event.startDate), 'dd/MM/yyyy')}\n` +
                `⏰ Hora: ${event.startTime || 'Sin hora'}\n` +
                `📍 Nueva ubicación: ${input}`;
    speak('He modificado la ubicación');
    addBotMessage(msg);
    askToContinue();
  };

  const resetConversation = () => {
    setMessages([]);
    setConversationState({ step: 'greeting' });
    setInputText('');
  };

  const toggleListening = async () => {
    if (!recognition) {
      toast({
        title: "No disponible",
        description: "El reconocimiento de voz no está disponible en este navegador",
        variant: "destructive"
      });
      return;
    }

    try {
      if (!isListening) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognition.start();
        setIsListening(true);
      } else {
        recognition.stop();
        setIsListening(false);
      }
    } catch (error) {
      console.error('Microphone permission error:', error);
      toast({
        title: "Error de permisos",
        description: "Necesitas permitir el acceso al micrófono",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      addUserMessage(inputText);
      processUserInputWithState(inputText);
      setInputText('');
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="fixed bottom-24 right-8 rounded-full w-16 h-16 shadow-lg glow-effect"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <div className="fixed bottom-8 right-8 w-96 h-[600px] glass-effect rounded-lg shadow-xl flex flex-col">
          <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary to-accent text-white rounded-t-lg">
            <h3 className="font-semibold">Asistente OronixOS</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsOpen(false);
                resetConversation();
              }}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t space-y-2">
            <div className="flex gap-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe tu respuesta..."
                className="flex-1"
              />
              <Button
                onClick={toggleListening}
                size="icon"
                variant={isListening ? 'destructive' : 'outline'}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button onClick={handleSendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;