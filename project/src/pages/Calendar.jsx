import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { format } from 'date-fns';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  AlignLeft, 
  Tag,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarLucide,
  Grid,
  List,
  LayoutGrid,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const priorityColors = {
  low: '#22c55e',    // green-500
  medium: '#eab308', // yellow-500
  high: '#ef4444'    // red-500
};

const ViewButton = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
      isActive
        ? 'bg-purple-500/30 text-purple-300'
        : 'bg-black/30 text-gray-400 hover:bg-purple-500/20 hover:text-purple-300'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const TaskCard = ({ task, onStatusChange }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="bg-black/30 backdrop-blur-md border border-purple-500/20 rounded-lg p-4 space-y-3"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority || 'medium']}`} />
          <h3 className="text-lg font-semibold text-white">{task.title}</h3>
        </div>
        {task.description && (
          <p className="text-gray-400 mt-1 text-sm line-clamp-2">{task.description}</p>
        )}
      </div>
      <div className="flex space-x-1">
        {task.status !== 'completed' && (
          <button
            onClick={() => onStatusChange(task.id, 'completed')}
            className="p-1 text-gray-400 hover:text-green-500 transition-colors"
            title="Mark as completed"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        )}
        {task.status !== 'archived' && (
          <button
            onClick={() => onStatusChange(task.id, 'archived')}
            className="p-1 text-gray-400 hover:text-gray-500 transition-colors"
            title="Archive task"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center space-x-2 text-gray-400">
        <Clock3 className="w-4 h-4" />
        <span>{format(new Date(task.deadline), 'MMM d, h:mm a')}</span>
      </div>
      <div className={`px-2 py-1 rounded-full text-xs ${
        task.status === 'completed' ? 'bg-green-500/20 text-green-300' :
        task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
        task.status === 'archived' ? 'bg-gray-500/20 text-gray-300' :
        'bg-yellow-500/20 text-yellow-300'
      }`}>
        {task.status.replace('_', ' ')}
      </div>
    </div>
  </motion.div>
);

function Calendar() {
  const { isDark } = useTheme();
  const { addNotification } = useNotification();
  const [tasks, setTasks] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentView, setCurrentView] = useState('timeGridWeek');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const calendarRef = React.useRef(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTasks = data.map(task => ({
        id: task.id,
        title: task.title,
        start: task.deadline,
        end: task.deadline,
        backgroundColor: priorityColors[task.priority || 'medium'],
        borderColor: priorityColors[task.priority || 'medium'],
        textColor: '#ffffff',
        extendedProps: {
          description: task.description,
          priority: task.priority,
          category: task.category,
          status: task.status
        }
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      addNotification('Failed to load tasks', 'error');
    }
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setShowEventModal(true);
  };

  const handleDateSelect = (selectInfo) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();
    setSelectedDate(selectInfo.start);
    setSelectedEvent({
      start: selectInfo.start,
      end: selectInfo.end,
      allDay: selectInfo.allDay
    });
    setShowEventModal(true);
  };

  const handleEventDrop = async (info) => {
    try {
      const { event } = info;
      const { error } = await supabase
        .from('tasks')
        .update({
          deadline: event.start,
          updated_at: new Date().toISOString()
        })
        .eq('id', event.id);

      if (error) throw error;
      addNotification('Event updated successfully', 'success');
    } catch (error) {
      console.error('Error updating event:', error);
      addNotification('Failed to update event', 'error');
      info.revert();
    }
  };

  const handleViewChange = (newView) => {
    setCurrentView(newView);
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView(newView);
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.today();
    setSelectedDate(new Date());
  };

  const handlePrev = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.prev();
    setSelectedDate(calendarApi.getDate());
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.next();
    setSelectedDate(calendarApi.getDate());
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;
      addNotification(`Task marked as ${newStatus}`, 'success');
      loadTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      addNotification('Failed to update task status', 'error');
    }
  };

  const getTasksForSelectedDate = () => {
    return tasks.filter(task => {
      const taskDate = new Date(task.start);
      return (
        taskDate.getFullYear() === selectedDate.getFullYear() &&
        taskDate.getMonth() === selectedDate.getMonth() &&
        taskDate.getDate() === selectedDate.getDate()
      );
    });
  };

  return (
    <div className="min-h-screen p-6 relative" style={{
      backgroundImage: "url('https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg?auto=compress&cs=tinysrgb&w=1920')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="absolute inset-0 bg-black/25 dark:bg-black/60" />

      <div className="relative z-10 max-w-[1600px] mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Time Matrix
            </h1>
            <button
              onClick={handleToday}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Today
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrev}
                className="p-2 rounded-lg bg-black/30 text-gray-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-lg bg-black/30 text-gray-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex space-x-2">
            <ViewButton
              icon={CalendarDays}
              label="Year"
              isActive={currentView === 'multiMonthYear'}
              onClick={() => handleViewChange('multiMonthYear')}
            />
            <ViewButton
              icon={Grid}
              label="Month"
              isActive={currentView === 'dayGridMonth'}
              onClick={() => handleViewChange('dayGridMonth')}
            />
            <ViewButton
              icon={LayoutGrid}
              label="Week"
              isActive={currentView === 'timeGridWeek'}
              onClick={() => handleViewChange('timeGridWeek')}
            />
            <ViewButton
              icon={CalendarLucide}
              label="Day"
              isActive={currentView === 'timeGridDay'}
              onClick={() => handleViewChange('timeGridDay')}
            />
            <ViewButton
              icon={List}
              label="List"
              isActive={currentView === 'listWeek'}
              onClick={() => handleViewChange('listWeek')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-black/30 backdrop-blur-md border border-purple-500/20 rounded-xl overflow-hidden">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, multiMonthPlugin]}
              initialView="timeGridWeek"
              headerToolbar={false}
              events={tasks}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              expandRows={true}
              height="auto"
              allDaySlot={false}
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              eventClick={handleEventClick}
              select={handleDateSelect}
              eventDrop={handleEventDrop}
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }}
              nowIndicator={true}
              scrollTimeReset={false}
              className={isDark ? 'fc-dark' : 'fc-light'}
            />
          </div>

          <div className="bg-black/30 backdrop-blur-md border border-purple-500/20 rounded-xl p-4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">
                Tasks for {format(selectedDate, 'MMMM d, yyyy')}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <AlertCircle className="w-4 h-4" />
                <span>Click on calendar to add new tasks</span>
              </div>
            </div>

            <div className="space-y-4">
              {getTasksForSelectedDate().length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No tasks scheduled for this date
                </div>
              ) : (
                getTasksForSelectedDate().map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;