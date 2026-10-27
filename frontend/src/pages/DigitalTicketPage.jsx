import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Printer,
  Copy,
  Check,
  ArrowLeft,
  ShieldCheck,
  Ticket,
  User,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const DigitalTicketPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await api.getTicket(ticketId);
        if (res.success && res.ticket) {
          setTicket(res.ticket);
        } else {
          setError('Ticket not found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve ticket.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  const handleCopyCode = () => {
    if (!ticket) return;
    navigator.clipboard.writeText(ticket.ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading your digital pass...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Ticket Not Found</h2>
        <p className="text-xs text-slate-400">
          The ticket reference "{ticketId}" could not be verified in the platform.
        </p>
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to My Bookings</span>
        </Link>
      </div>
    );
  }

  const ev = ticket.event || {};
  const bk = ticket.booking || {};
  const isUsed = ticket.status === 'used';
  const isCancelled = ticket.status === 'cancelled';
  const isValid = ticket.status === 'valid';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Top Bar Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/my-bookings')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Bookings</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-navy-900 border border-slate-700 hover:border-purple-500 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-purple-400" />
            <span>Print Pass</span>
          </button>
        </div>
      </div>

      {/* Digital Ticket Card */}
      <div className="relative rounded-3xl bg-navy-900/95 border border-slate-700/80 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Ticket Header Banner */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-900">
          <img
            src={ev.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80'}
            alt={ev.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/60 to-transparent"></div>

          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-navy-950/80 backdrop-blur-md text-purple-300 border border-purple-500/40">
              {ev.category || 'Event Pass'}
            </span>
          </div>

          <div className="absolute top-4 right-4">
            {isValid && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 flex items-center gap-1 shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                VALID TICKET
              </span>
            )}
            {isUsed && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950/90 text-amber-300 border border-amber-500/50 flex items-center gap-1 shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                CHECKED IN
              </span>
            )}
            {isCancelled && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-950/90 text-rose-300 border border-rose-500/50 flex items-center gap-1 shadow-md">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                CANCELLED
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight line-clamp-1">
              {ev.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                {ev.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-accent-cyan" />
                {ev.time}
              </span>
            </div>
          </div>
        </div>

        {/* Notched perforated separator */}
        <div className="relative flex items-center justify-between px-4 py-2 border-y border-dashed border-slate-700/80 bg-navy-950/40">
          <div className="w-5 h-5 rounded-full bg-navy-950 -ml-6 border-r border-slate-700"></div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">
            EVENTIFY DIGITAL ENTRY PASS
          </span>
          <div className="w-5 h-5 rounded-full bg-navy-950 -mr-6 border-l border-slate-700"></div>
        </div>

        {/* Ticket Details & QR Code Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Attendee & Event Metadata (2 Cols) */}
          <div className="md:col-span-2 space-y-5">
            <div>
              <p className="text-xs uppercase font-semibold tracking-wider text-slate-400">Attendee Name</p>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {ticket.attendee?.name || bk.attendeeDetails?.name || 'Jordan Taylor'}
              </h3>
              <p className="text-xs text-slate-400">
                {ticket.attendee?.email || bk.attendeeDetails?.email || 'attendee@eventify.com'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800">
              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-400">Venue</p>
                <p className="text-xs font-medium text-slate-200 mt-0.5 line-clamp-2">
                  {ev.venue || 'Virtual Stream'}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-400">Booking Ref</p>
                <p className="text-xs font-mono font-semibold text-purple-400 mt-0.5">
                  {bk.bookingReference || 'EVT-2026-X'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800">
              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-400">Admission Tier</p>
                <p className="text-xs font-medium text-white mt-0.5">
                  General Admission ({ev.ticketPrice === 0 ? 'Complimentary' : `$${ev.ticketPrice}`})
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-400">Pass Security</p>
                <p className="text-xs text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified SHA-256
                </p>
              </div>
            </div>

            {isUsed && ticket.usedAt && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Gate admission recorded on {new Date(ticket.usedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* QR Code Presentation Box (1 Col) */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-slate-300 shadow-xl space-y-3">
            <div className="p-2 bg-white rounded-xl">
              <QRCodeSVG
                value={ticket.qrData || ticket.ticketCode}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Ticket Code & Copy */}
            <div className="w-full text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Verification Code
              </span>
              <div className="flex items-center justify-center gap-1.5 font-mono text-xs font-extrabold text-navy-950 bg-slate-100 py-1 px-2 rounded-lg border border-slate-300">
                <span>{ticket.ticketCode}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1 hover:text-purple-600 transition-colors"
                  title="Copy Ticket Code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-navy-950/80 border-t border-slate-800 text-center text-[11px] text-slate-400">
          Present this barcode or QR code at event entrance. Each ticket code is server-verified atomically for single entry.
        </div>
      </div>
    </div>
  );
};

