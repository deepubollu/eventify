import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  Tag,
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

const IMAGE_PRESETS = [
  { label: 'Technology', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Concert', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Coding Workshop', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Business Pitch', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Culinary & Wine', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Wellness Yoga', url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&auto=format&fit=crop&q=80' },
];

export const CreateEventPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('18:00');
  const [venue, setVenue] = useState('');
  const [locationType, setLocationType] = useState('in-person');
  const [ticketPrice, setTicketPrice] = useState(0);
  const [capacity, setCapacity] = useState(100);
  const [image, setImage] = useState(IMAGE_PRESETS[0].url);
  const [tags, setTags] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !date || !time || !venue || !capacity) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.createEvent({
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

      if (res.success && res.event) {
        navigate(`/events/${res.event._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Organizer Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Create a New Event</h1>
        <p className="text-sm text-slate-400">
          Publish your event to the Eventify network, set ticket pricing, and enable atomic QR code gate verification.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-navy-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-8">
        {error && (
          <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Basic Event Info */}
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
              placeholder="e.g. NextGen AI & Developer Summit 2026"
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
              Detailed Description *
            </label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail your event agenda, guest speakers, schedule, attendee perks, and what to bring..."
              className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors leading-relaxed"
            />
          </div>
        </div>

        {/* Date, Time & Venue */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400">2. Date, Time & Venue</h3>

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
                Time (e.g. 18:30) *
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
              Venue Location / Streaming Link *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Moscone Center, San Francisco or Zoom Live Stream"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Ticketing & Capacity */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400">3. Tickets & Capacity</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Ticket Price (USD) * (0 for Free)
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
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Set 0 for free complimentary event passes</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Attendee Capacity Limit *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="1"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="100"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Prevents overbooking once maximum is reached</span>
            </div>
          </div>
        </div>

        {/* Image & Tags */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400">4. Visuals & Discovery</h3>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Banner Image URL
            </label>
            <div className="relative mb-2">
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-slate-400">Presets:</span>
              {IMAGE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImage(preset.url)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    image === preset.url
                      ? 'bg-purple-600/30 text-purple-300 border-purple-500'
                      : 'bg-navy-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Image Preview */}
            {image && (
              <div className="mt-3 h-40 w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Search Tags (comma separated)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="AI, Tech, React, Design"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-purple-600 via-accent-violet to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-glow-purple disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Publishing Event...</span>
              </>
            ) : (
              <>
                <span>Publish Event Live</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

