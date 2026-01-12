import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

const CalendarWidget = ({ events = [], selectedDate, onDateSelect }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start week on Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    // Helper to check if a date has events
    const hasEvent = (date) => {
        if (!events || !Array.isArray(events)) return false;
        return events.some(event => {
            if (!event.startTime) return false;
            try {
                const eventDate = typeof event.startTime === 'string' ? parseISO(event.startTime) : new Date(event.startTime);
                return isSameDay(eventDate, date);
            } catch (e) {
                return false;
            }
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <span className="font-bold text-gray-900 capitalize">
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={prevMonth}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={nextMonth}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="h-8 flex items-center justify-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isDayToday = isToday(day);
                    const dayHasEvent = hasEvent(day);

                    return (
                        <button
                            key={day.toString()}
                            onClick={() => onDateSelect(day)}
                            className={`
                                relative h-9 w-full rounded-lg text-sm flex items-center justify-center transition-all duration-200
                                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'}
                                ${isSelected ? '!bg-primary !text-white shadow-md shadow-primary/30 font-bold' : ''}
                                ${isDayToday && !isSelected ? 'text-primary font-bold bg-primary/5' : ''}
                                ${dayHasEvent && !isSelected ? 'font-semibold' : ''}
                            `}
                        >
                            {format(day, 'd')}
                            
                            {/* Event Dot */}
                            {dayHasEvent && (
                                <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`}></div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Footer / Clear Action */}
            {selectedDate && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
                    <button 
                        onClick={() => onDateSelect(null)}
                        className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
                    >
                        <X className="w-3 h-3" />
                        Clear Date Filter
                    </button>
                </div>
            )}
            
            {!selectedDate && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">Select a date to filter events</p>
                </div>
            )}
        </div>
    );
};

export default CalendarWidget;
