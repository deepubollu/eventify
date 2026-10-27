import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Ticket, ArrowUpRight, Sparkles } from 'lucide-react';

export const EventCard = ({ event }) => {
  const isFree = Number(event.ticketPrice) === 0;
  const capacity = Number(event.capacity) || 1;
  const registered = Number(event.registeredCount) || 0;
  const remaining = Math.max(0, capacity - registered);
  const percentFilled = Math.min(100, Math.round((registered / capacity) * 100));
  const isSoldOut = remaining === 0;

  // Format date nicely (e.g., Nov 15, 2026)
  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="group relative rounded-2xl bg-navy-900/70 border border-slate-800/90 hover:border-purple-500/50 transition-all duration-300 hover:shadow-glow-purple flex flex-col overflow-hidden backdrop-blur-sm">
      {/* Image & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80'}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent"></div>

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-navy-950/80 backdrop-blur-md text-purple-300 border border-purple-500/30">
            {event.category}
          </span>
        </div>

        {/* Price Tag */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
              isFree
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : 'bg-purple-950/80 text-purple-200 border-purple-500/40 shadow-sm'
            }`}
          >
            {isFree ? 'FREE' : `$${event.ticketPrice}`}
          </span>
        </div>

        {/* Featured Tag */}
        {event.featured && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Featured
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Date & Time */}
          <div className="flex items-center gap-2 text-xs font-medium text-purple-400 mb-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {formatDate(event.date)} • {event.time}
            </span>
          </div>

          {/* Title */}
          <Link to={`/events/${event._id}`}>
            <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1 mb-2">
              {event.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {event.description}
          </p>

          {/* Venue */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Capacity Bar & CTA */}
        <div className="space-y-3 pt-3 border-t border-slate-800/80">
          <div>
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-500" />
                {registered} registered
              </span>
              <span className={`font-semibold ${isSoldOut ? 'text-rose-400' : 'text-slate-300'}`}>
                {isSoldOut ? 'Sold Out' : `${remaining} left`}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isSoldOut
                    ? 'bg-rose-500'
                    : percentFilled > 80
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                }`}
                style={{ width: `${percentFilled}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/events/${event._id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-purple-600/20 text-purple-200 border border-purple-500/30 hover:bg-purple-600 hover:text-white transition-all group-hover:border-purple-500"
            >
              <span>{isSoldOut ? 'View Event' : isFree ? 'Register Free' : 'Book Tickets'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

