import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { EventCard } from '../components/EventCard';
import {
  Search,
  Sparkles,
  Calendar,
  QrCode,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Compass,
  Cpu,
  Music,
  GraduationCap,
  Briefcase,
  Activity,
  UtensilsCrossed,
  Layers,
  Loader2,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Technology', icon: Cpu, desc: 'AI summits, cloud & dev cons', color: 'from-blue-500/20 to-purple-500/20' },
  { name: 'Music & Concerts', icon: Music, desc: 'Live festivals & acoustic nights', color: 'from-purple-500/20 to-pink-500/20' },
  { name: 'Workshops & Education', icon: GraduationCap, desc: 'Hands-on masterclasses & bootcamps', color: 'from-emerald-500/20 to-teal-500/20' },
  { name: 'Business & Networking', icon: Briefcase, desc: 'Founder pitch nights & VC meetups', color: 'from-amber-500/20 to-orange-500/20' },
  { name: 'Sports & Fitness', icon: Activity, desc: 'Marathons, yoga & group sessions', color: 'from-rose-500/20 to-red-500/20' },
  { name: 'Food & Drink', icon: UtensilsCrossed, desc: 'Culinary tastings & barista tours', color: 'from-cyan-500/20 to-blue-500/20' },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.getEvents({ status: 'published' });
        if (res.success && res.events) {
          // Sort featured or top 6
          const featured = res.events.filter((e) => e.featured).concat(res.events).slice(0, 6);
          setFeaturedEvents(featured);
        }
      } catch (err) {
        console.error('Error fetching featured events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/events?${params.toString()}`);
  };

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-600/20 rounded-full blur-[130px] -z-10 pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-indigo-600/15 rounded-full blur-[110px] -z-10 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-semibold backdrop-blur-md shadow-glow-purple">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>The Premier Event Ticketing & QR Verification Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Create, Discover & Experience{' '}
            <span className="bg-gradient-to-r from-purple-400 via-accent-violet to-indigo-300 bg-clip-text text-transparent">
              Unforgettable Events
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            From tech summits and live concerts to masterclasses and pitch nights. Book digital tickets with unique QR codes and verify entrance in real-time.
          </p>

          {/* Interactive Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-3xl mx-auto p-2.5 rounded-2xl bg-navy-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center gap-2.5"
          >
            <div className="relative flex-1 w-full flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by title, topics, or venue..."
                className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="w-full md:w-56 border-t md:border-t-0 md:border-l border-slate-700/60 pl-0 md:pl-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-3 px-3 bg-transparent text-sm text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-navy-900 text-slate-200">All Categories</option>
                <option value="Technology" className="bg-navy-900 text-slate-200">Technology</option>
                <option value="Music & Concerts" className="bg-navy-900 text-slate-200">Music & Concerts</option>
                <option value="Workshops & Education" className="bg-navy-900 text-slate-200">Workshops & Education</option>
                <option value="Business & Networking" className="bg-navy-900 text-slate-200">Business & Networking</option>
                <option value="Sports & Fitness" className="bg-navy-900 text-slate-200">Sports & Fitness</option>
                <option value="Food & Drink" className="bg-navy-900 text-slate-200">Food & Drink</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-sm text-white shadow-glow-purple transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Key Stat Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Over <strong className="text-white">1,500+</strong> Events Hosted</span>
            </div>
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-accent-cyan" />
              <span><strong className="text-white">100%</strong> QR Ticket Verification</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Instant Capacity Protection</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Categories</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Explore By Category</h2>
          </div>
          <Link
            to="/events"
            className="text-sm font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/events?category=${encodeURIComponent(cat.name)}`}
                className="group p-5 rounded-2xl bg-navy-900/60 border border-slate-800 hover:border-purple-500/50 hover:bg-navy-850/80 transition-all duration-300 flex items-start gap-4"
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${cat.color} border border-slate-700/50 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-6 h-6 text-purple-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{cat.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured & Upcoming Events Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Trending Now</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Upcoming Premier Events</h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-navy-900 border border-slate-700 hover:border-purple-500 transition-all"
          >
            <Compass className="w-4 h-4 text-purple-400" />
            <span>Browse All Events</span>
          </Link>
        </div>

        {loading ? (
          <div className="min-h-[250px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : featuredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 p-8 rounded-2xl bg-navy-900/50 border border-slate-800">
            <Calendar className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No events found</h3>
            <p className="text-xs text-slate-400 mt-1">Be the first to create and host an event!</p>
          </div>
        )}
      </section>

      {/* How Eventify Works (3 Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-navy-900/90 to-navy-950/90 border border-slate-800 relative overflow-hidden space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Streamlined Process</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How Eventify Works</h2>
            <p className="text-sm text-slate-300">
              A frictionless end-to-end event experience built for attendees, event organizers, and on-site gate staff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-navy-950/70 border border-slate-800/80 space-y-4 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-extrabold text-lg">
                01
              </div>
              <h3 className="text-lg font-bold text-white">Discover & Register</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter through curated tech summits, concerts, and workshops. Reserve tickets instantly with automated capacity control.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-navy-950/70 border border-slate-800/80 space-y-4 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-accent-violet/10 border border-accent-violet/30 flex items-center justify-center text-accent-violet font-extrabold text-lg">
                02
              </div>
              <h3 className="text-lg font-bold text-white">Receive Digital QR Pass</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Each confirmed attendee receives a unique cryptographic digital ticket with an encoded QR code ready to save or print.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-navy-950/70 border border-slate-800/80 space-y-4 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-lg">
                03
              </div>
              <h3 className="text-lg font-bold text-white">Scan & Verify Entrance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Organizers scan barcodes or QR codes at the gate with any camera or device. Check-ins are validated atomically to eliminate duplicates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Organizer Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-navy-900/80 border border-purple-500/30 shadow-glow-purple flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">Organize With Confidence</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Hosting an Upcoming Event?</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Launch your registration in minutes, monitor ticket sales with live Recharts analytics, and verify gate check-ins with our high-speed QR scanner.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              to="/create-event"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-glow-purple transition-all"
            >
              Create Your Event
            </Link>
            <Link
              to="/organizer-dashboard"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-navy-950/80 border border-slate-700 hover:bg-slate-800 transition-all"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

