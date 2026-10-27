import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  ArrowUpRight,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  QrCode,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  // Cancel modal state
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getMyBookings();
      if (res.success && res.bookings) {
        setBookings(res.bookings);
      }
    } catch (err) {
      setError(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    setCancelLoading(true);
    setCancelError('');

    try {
      const res = await api.cancelBooking(cancellingBooking._id);
      if (res.success) {
        setCancelSuccess('Booking cancelled successfully.');
        setTimeout(() => {
          setCancellingBooking(null);
          setCancelSuccess('');
          fetchBookings();
        }, 1200);
      }
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel booking.');
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'confirmed') return b.bookingStatus === 'confirmed';
    if (filter === 'cancelled') return b.bookingStatus === 'cancelled';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Ticket className="w-3.5 h-3.5" />
            <span>Passes & Registrations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">My Bookings</h1>
          <p className="text-sm text-slate-400">
            Access your digital tickets, display QR codes at entrance gates, or manage registrations.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-navy-900 border border-slate-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'confirmed' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'cancelled' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[350px] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-3" />
          <p className="text-sm text-slate-400">Loading your tickets...</p>
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((bk) => {
            const ev = bk.event || {};
            const isCancelled = bk.bookingStatus === 'cancelled';
            const firstTicket = bk.tickets && bk.tickets[0];

            return (
              <div
                key={bk._id}
                className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-700 transition-all"
              >
                {/* Event Thumbnail & Info */}
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  <img
                    src={ev.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&auto=format&fit=crop&q=80'}
                    alt={ev.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 border border-slate-800"
                  />

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-md bg-navy-950 text-purple-400 border border-purple-500/30">
                        {bk.bookingReference}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          isCancelled
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {isCancelled ? 'Cancelled' : 'Confirmed'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">{ev.title}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        {ev.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-accent-cyan" />
                        {ev.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[200px]">{ev.venue}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 pt-1">
                      Tickets: <strong className="text-white">{bk.ticketsCount}</strong> • Total Paid:{' '}
                      <strong className="text-purple-300">
                        {bk.totalAmount === 0 ? 'Free' : `$${bk.totalAmount}`}
                      </strong>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {firstTicket && !isCancelled && (
                    <Link
                      to={`/ticket/${firstTicket.ticketCode}`}
                      className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-glow-purple flex items-center justify-center gap-1.5 transition-all"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>View QR Ticket</span>
                    </Link>
                  )}

                  {!isCancelled && (
                    <button
                      type="button"
                      onClick={() => setCancellingBooking(bk)}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-500/30 hover:bg-rose-950/80 transition-colors"
                    >
                      Cancel
                    </button>
                  )}

                  <Link
                    to={`/events/${ev._id}`}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
                    title="View Event Details"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-3xl bg-navy-900/50 border border-slate-800 space-y-4">
          <Ticket className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-xl font-bold text-white">No bookings yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Explore our curated calendar of developer summits, concerts, and workshops to book your first digital ticket.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-glow-purple"
          >
            <span>Explore Events</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-navy-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Cancel Event Booking?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to cancel booking{' '}
                <strong className="text-white">{cancellingBooking.bookingReference}</strong> for{' '}
                <span className="text-purple-300">"{cancellingBooking.event?.title}"</span>? Your QR tickets will be permanently invalidated and the capacity spot restored.
              </p>
            </div>

            {cancelError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs">
                {cancelError}
              </div>
            )}

            {cancelSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs">
                {cancelSuccess}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                disabled={cancelLoading}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={cancelLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

