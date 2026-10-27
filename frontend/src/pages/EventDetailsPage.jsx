import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookingModal } from '../components/BookingModal';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  Share2,
  Check,
  Edit,
  ArrowLeft,
  ShieldCheck,
  Globe,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.getEventById(id);
        if (res.success && res.event) {
          setEvent(res.event);
        } else {
          setError('Event not found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">{error || 'Event Not Found'}</h2>
        <p className="text-sm text-slate-400">The event you are looking for may have been removed or unpublished.</p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Events</span>
        </Link>
      </div>
    );
  }

  const isFree = Number(event.ticketPrice) === 0;
  const capacity = Number(event.capacity) || 1;
  const registered = Number(event.registeredCount) || 0;
  const remaining = Math.max(0, capacity - registered);
  const percentFilled = Math.min(100, Math.round((registered / capacity) * 100));
  const isSoldOut = remaining === 0;

  const isOwner =
    user && (String(event.organizer?._id || event.organizer) === String(user._id) || user.role === 'admin');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </button>
      </div>

      {/* Main Banner Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="relative h-72 sm:h-96 w-full">
          <img
            src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&auto=format&fit=crop&q=80'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-transparent"></div>

          {/* Badges on top */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-navy-950/80 backdrop-blur-md text-purple-300 border border-purple-500/40">
              {event.category}
            </span>
            <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-navy-950/80 backdrop-blur-md text-slate-300 border border-slate-700 capitalize flex items-center gap-1">
              <Globe className="w-3 h-3 text-purple-400" />
              {event.locationType || 'In-Person'}
            </span>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-navy-950/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white hover:border-purple-500 transition-all flex items-center gap-1.5 text-xs font-medium"
              title="Copy event link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>

            {isOwner && (
              <Link
                to={`/edit-event/${event._id}`}
                className="px-3 py-2 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-all shadow-glow-purple"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Event</span>
              </Link>
            )}
          </div>

          {/* Title and Key Details in Banner Bottom */}
          <div className="absolute bottom-6 left-6 right-6 space-y-3">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-cyan" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent-violet" />
                <span>{event.venue}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Registration Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Description & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Event */}
          <div className="p-8 rounded-3xl bg-navy-900/60 border border-slate-800 backdrop-blur-sm space-y-4">
            <h3 className="text-xl font-bold text-white tracking-tight">About This Event</h3>
            <div className="text-sm text-slate-300 leading-relaxed space-y-4 whitespace-pre-line">
              {event.description}
            </div>

            {event.tags && event.tags.length > 0 && (
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap gap-2">
                {event.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-navy-950 border border-slate-800 text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Organizer Card */}
          <div className="p-6 rounded-3xl bg-navy-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-400">Event Host</h4>
            <div className="flex items-center gap-4">
              <img
                src={event.organizer?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                alt={event.organizerName}
                className="w-14 h-14 rounded-2xl object-cover border border-purple-500/30"
              />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">
                  {event.organizer?.name || event.organizerName}
                </h4>
                <p className="text-xs text-slate-400">
                  {event.organizer?.bio || 'Verified Eventify Experience Creator & Organizer'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Box */}
        <div className="space-y-6">
          <div className="sticky top-28 p-6 rounded-3xl bg-navy-900/90 border border-purple-500/30 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="space-y-2 border-b border-slate-800 pb-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Admission</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white">
                  {isFree ? 'Free' : `$${event.ticketPrice}`}
                </span>
                {!isFree && <span className="text-xs text-slate-400">/ per ticket</span>}
              </div>
              <p className="text-xs text-purple-300/80">
                Includes digital ticket pass with instantaneous QR code verification.
              </p>
            </div>

            {/* Capacity status */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  Capacity Filled
                </span>
                <span className="font-semibold text-white">
                  {registered} / {capacity} ({percentFilled}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
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
              <div className="flex justify-between text-[11px]">
                <span className={isSoldOut ? 'text-rose-400 font-bold' : 'text-emerald-400 font-semibold'}>
                  {isSoldOut ? 'Event Sold Out' : `${remaining} tickets available`}
                </span>
                <span className="text-slate-500">Fast atomic check-in</span>
              </div>
            </div>

            {/* Action CTA */}
            <div>
              <button
                type="button"
                disabled={isSoldOut}
                onClick={() => setBookingModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-glow-purple disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                <Ticket className="w-4 h-4" />
                <span>{isSoldOut ? 'Sold Out' : isFree ? 'Register Free Now' : 'Book Tickets Now'}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1.5 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant QR code generation upon confirmation</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Cancellation permitted before event start</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModalOpen && (
        <BookingModal
          event={event}
          onClose={() => setBookingModalOpen(false)}
          onBookingSuccess={() => {
            setBookingModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

