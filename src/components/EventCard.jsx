import React from 'react';
import { Calendar, MapPin, ArrowRight, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const categoryColors = {
  ACADEMIC: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  SOCIAL: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  CAREER: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  SPORT: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  VOLUNTEERING: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  OTHER: 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
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
    <div className="group bg-card rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden bg-muted">
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
        <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>

        <p className="text-muted-foreground text-sm font-normal line-clamp-2 mb-6 leading-relaxed font-medium">
          {description}
        </p>

        <div className="space-y-3 mb-8 text-sm text-foreground/80">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Calendar className="w-4 h-4" />
                </div>
                <span className="font-semibold">{date}</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Clock className="w-4 h-4" />
                </div>
                <span className="font-semibold">{time}</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <MapPin className="w-4 h-4" />
                </div>
                <span className="font-semibold truncate">{location}</span>
            </div>
        </div>

        {/* Occupancy & Progress Bar */}
        <div className="mt-auto">
            <div className="flex justify-between items-end mb-2.5">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Locuri Ocupate</span>
                </div>
                <span className="text-xs font-bold text-primary">{participantCount || 0} / {maxCapacity}</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${occupancyPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-orange-400 to-primary rounded-full"
                />
            </div>
        </div>

        <Link to={`/events/${id}`} className="mt-8 block no-underline">
            <button className="w-full py-4 rounded-2xl bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-primary/10 active:scale-95 border-none cursor-pointer">
                <span className="no-underline">Vezi Detalii</span>
                <ArrowRight className="w-4 h-4" />
            </button>
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
