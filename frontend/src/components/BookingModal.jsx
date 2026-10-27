import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  X,
  Ticket,
  Calendar,
  MapPin,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export const BookingModal = ({ event, onClose, onBookingSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [ticketsCount, setTicketsCount] = useState(1);
  const [attendeeName, setAttendeeName] = useState(user?.name || '');
  const [attendeeEmail, setAttendeeEmail] = useState(user?.email || '');
  const [attendeePhone, setAttendeePhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFree = Number(event.ticketPrice) === 0;
  const unitPrice = Number(event.ticketPrice) || 0;
  const totalPrice = unitPrice * ticketsCount;
  const remaining = Math.max(0, event.capacity - event.registeredCount);
  const maxAvailable = Math.min(5, remaining);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!attendeeName.trim() || !attendeeEmail.trim()) {
      setError('Please provide your name and email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.createBooking({
        eventId: event._id,
        ticketsCount,
        attendeeDetails: {
          name: attendeeName.trim(),
          email: attendeeEmail.trim(),
          phone: attendeePhone.trim(),
          notes: notes.trim(),
        },
      });

      if (res.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#A855F7', '#6366F1', '#3B82F6', '#10B981'],
        });

        if (onBookingSuccess) {
          onBookingSuccess(res.booking, res.tickets);
        }

        // Navigate to the newly generated ticket or bookings
        if (res.tickets && res.tickets[0]) {
          navigate(`/ticket/${res.tickets[0].ticketCode}`);
        } else {
          navigate('/my-bookings');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to complete booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-navy-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-purple-950/40 via-navy-900 to-indigo-950/40 flex items-start justify-between">
          <div className="space-y-1 pr-6">
            <span className="text-xs uppercase tracking-wider font-semibold text-purple-400">
              {isFree ? 'Free Event Registration' : 'Ticket Booking'}
            </span>
            <h3 className="text-xl font-bold text-white leading-snug line-clamp-1">{event.title}</h3>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                {event.date}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {event.venue}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Ticket Selector */}
          <div className="p-4 rounded-2xl bg-navy-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">General Admission Ticket</p>
                <p className="text-xs text-slate-400">
                  {isFree ? 'Complimentary pass with QR check-in' : `$${unitPrice} per attendee`}
                </p>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center gap-3 bg-navy-900 border border-slate-700/80 rounded-xl px-2.5 py-1">
                <button
                  type="button"
                  onClick={() => setTicketsCount((prev) => Math.max(1, prev - 1))}
                  disabled={ticketsCount <= 1}
                  className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-bold text-white">{ticketsCount}</span>
                <button
                  type="button"
                  onClick={() => setTicketsCount((prev) => Math.min(maxAvailable, prev + 1))}
                  disabled={ticketsCount >= maxAvailable}
                  className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex justify-between border-t border-slate-800/80 pt-2.5">
              <span>Remaining spots: {remaining}</span>
              <span>Max per order: {maxAvailable}</span>
            </div>
          </div>

          {/* Attendee Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Primary Attendee Information
            </h4>

            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="e.g. Jordan Taylor"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="e.g. attendee@eventify.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={attendeePhone}
                    onChange={(e) => setAttendeePhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Special Notes / Dietary</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="Optional notes"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Demo Notice */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-500/20 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300">Ticket subtotal ({ticketsCount}x):</span>
              <span className="text-white font-medium">{isFree ? 'Free' : `$${totalPrice}`}</span>
            </div>
            <div className="flex justify-between items-center text-base font-bold pt-2 border-t border-purple-500/20">
              <span className="text-white">Total Amount:</span>
              <span className="text-purple-300 text-lg">{isFree ? 'FREE' : `$${totalPrice}`}</span>
            </div>

            {!isFree && (
              <div className="flex items-center gap-2 pt-2 text-[11px] text-purple-300/80">
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                <span>
                  <strong>Demo Checkout Mode:</strong> No actual payment gateway credentials configured. Instant booking confirmation without credit card charge.
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || remaining === 0}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-glow-purple disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing Booking...
              </>
            ) : isFree ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Confirm Free Registration
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Confirm & Receive Digital Ticket (${totalPrice})
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

