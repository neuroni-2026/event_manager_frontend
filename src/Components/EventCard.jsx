import React from 'react';
import { Calendar, MapPin, ArrowRight, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const categoryColors = {
  ACADEMIC: 'bg-blue-50 text-blue-700 border-blue-100',
  SOCIAL: 'bg-orange-50 text-orange-700 border-orange-100',
  CAREER: 'bg-purple-50 text-purple-700 border-purple-100',
  SPORT: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  VOLUNTEERING: 'bg-amber-50 text-amber-700 border-amber-100',
  OTHER: 'bg-gray-50 text-gray-700 border-gray-100'
};

const formatDate = (dateString) => {
    if (!dateString) return { date: 'TBA', time: '--:--' };
    const date = new Date(dateString);
    return {
        date: new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }).format(date),
        time: new Intl.DateTimeFormat('ro-RO', { hour: '2-digit', minute: '2-digit' }).format(date)
    };
};

const EventCard = ({ event }) => {
  const { id, title, startTime, location, imageUrl, category, description, participantCount, maxCapacity } = event;
  const { date, time } = formatDate(startTime);
  const categoryStyle = categoryColors[category] || categoryColors.OTHER;
  
  const occupancyPercentage = Math.min(((participantCount || 0) / (maxCapacity || 1)) * 100, 100);

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <img 
          src={imageUrl || "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1000&auto=format&fit=crop"} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        <div className="absolute top-5 left-5 z-20">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${categoryStyle}`}>
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>

        <p className="text-gray-500 text-sm font-normal line-clamp-2 mb-6 leading-relaxed font-medium">
          {description}
        </p>

        <div className="space-y-3 mb-8 text-sm text-gray-600">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-primary/70 rounded-lg">
                    <Calendar className="w-4 h-4" />
                </div>
                <span className="font-semibold">{date}</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-primary/70 rounded-lg">
                    <Clock className="w-4 h-4" />
                </div>
                <span className="font-semibold">{time}</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-primary/70 rounded-lg">
                    <MapPin className="w-4 h-4" />
                </div>
                <span className="font-semibold truncate">{location}</span>
            </div>
        </div>

        {/* Occupancy & Progress Bar */}
        <div className="mt-auto">
            <div className="flex justify-between items-end mb-2.5">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Locuri Ocupate</span>
                </div>
                <span className="text-xs font-bold text-primary">{participantCount || 0} / {maxCapacity}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${occupancyPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-orange-400 to-primary rounded-full"
                />
            </div>
        </div>

        <Link to={`/events/${id}`} className="mt-8 block no-underline">
            <button className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-gray-900/10 hover:shadow-primary/20 active:scale-95 border-none cursor-pointer">
                <span className="no-underline">Vezi Detalii</span>
                <ArrowRight className="w-4 h-4" />
            </button>
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
