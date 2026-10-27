import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Tag,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES = [
  'Technology',
  'Music & Concerts',
  'Workshops & Education',
  'Business & Networking',
  'Sports & Fitness',
  'Arts & Culture',
  'Food & Drink',
  'Community',
];

export const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('18:00');
  const [venue, setVenue] = useState('');
  const [locationType, setLocationType] = useState('in-person');
  const [ticketPrice, setTicketPrice] = useState(0);
  const [capacity, setCapacity] = useState(100);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [image, setImage] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.getEventById(id);
        if (res.success && res.event) {
          const ev = res.event;
          setTitle(ev.title || '');
          setDescription(ev.description || '');
          setCategory(ev.category || 'Technology');
          setDate(ev.date || '');
          setTime(ev.time || '18:00');
          setVenue(ev.venue || '');
          setLocationType(ev.locationType || 'in-person');
          setTicketPrice(ev.ticketPrice || 0);
          setCapacity(ev.capacity || 100);
          setRegisteredCount(ev.registeredCount || 0);
          setImage(ev.image || '');
          setTags(Array.isArray(ev.tags) ? ev.tags.join(', ') : '');
        } else {
          setError('Event not found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch event.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (Number(capacity) < registeredCount) {
      setError(`Capacity cannot be lower than existing registrations (${registeredCount}).`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.updateEvent(id, {
        title,
        description,
        category,
        date,
        time,
        venue,
        locationType,
        ticketPrice: Number(ticketPrice),
        capacity: Number(capacity),
        image,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });

      if (res.success) {
        setSuccess('Event updated successfully!');
        setTimeout(() => {
          navigate(`/events/${id}`);
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to update event.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading event data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Edit Event</h1>
        <p className="text-sm text-slate-400">
          Modify event details, adjust capacity, or update event schedule.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-navy-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-8">
        {error && (
          <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400">1. Basic Information</h3>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-navy-900">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Event Format *
              </label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors cursor-pointer"
              >
                <option value="in-person" className="bg-navy-900">In-Person Experience</option>
                <option value="online" className="bg-navy-900">Online / Virtual Stream</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Description *
            </label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors leading-relaxed"
            />
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-800">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400">2. Schedule & Venue</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Date (YYYY-MM-DD) *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Time *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Venue Location / Streaming URL *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-800">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400">3. Tickets & Capacity</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Ticket Price (USD) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Capacity Limit (Registered: {registeredCount}) *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={registeredCount || 1}
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-800">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400">4. Visuals & Tags</h3>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Banner Image URL
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Search Tags
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-purple-600 via-accent-violet to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-glow-purple disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Updating Event...</span>
              </>
            ) : (
              <>
                <span>Save Changes</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

