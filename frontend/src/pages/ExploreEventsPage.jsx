import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { EventCard } from '../components/EventCard';
import {
  Search,
  Filter,
  Compass,
  SlidersHorizontal,
  RotateCcw,
  Loader2,
  Calendar,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Technology',
  'Music & Concerts',
  'Workshops & Education',
  'Business & Networking',
  'Sports & Fitness',
  'Food & Drink',
];

export const ExploreEventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [priceType, setPriceType] = useState(searchParams.get('priceType') || 'all');
  const [locationType, setLocationType] = useState('all');
  const [sort, setSort] = useState('date_asc');

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state with query parameters
  useEffect(() => {
    const qSearch = searchParams.get('search');
    const qCategory = searchParams.get('category');
    const qPriceType = searchParams.get('priceType');

    if (qSearch !== null) setSearch(qSearch);
    if (qCategory) setCategory(qCategory);
    if (qPriceType) setPriceType(qPriceType);
  }, [searchParams]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        category: category !== 'All' ? category : undefined,
        priceType: priceType !== 'all' ? priceType : undefined,
        locationType: locationType !== 'all' ? locationType : undefined,
        sort,
        status: 'published',
      };
      const res = await api.getEvents(params);
      if (res.success && res.events) {
        setEvents(res.events);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category, priceType, locationType, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setPriceType('all');
    setLocationType('all');
    setSort('date_asc');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5" />
          <span>Discover Experiences</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Explore Events</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Browse upcoming summits, concerts, workshops, and gatherings. Filter by category, format, or ticket price.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-4 backdrop-blur-md">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, topics, keywords, or venue..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-purple-600 text-white shadow-glow-purple border border-purple-400'
                  : 'bg-navy-950 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-3">
            {/* Price Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Price:</span>
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
                className="py-1 px-2.5 rounded-lg bg-navy-950 border border-slate-700 text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Prices</option>
                <option value="free">Free Events</option>
                <option value="paid">Paid Events</option>
              </select>
            </div>

            {/* Location Type */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Format:</span>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                className="py-1 px-2.5 rounded-lg bg-navy-950 border border-slate-700 text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Formats</option>
                <option value="in-person">In-Person</option>
                <option value="online">Online / Virtual</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Sort By:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="py-1 px-2.5 rounded-lg bg-navy-950 border border-slate-700 text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="date_asc">Date: Upcoming First</option>
                <option value="date_desc">Date: Latest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors py-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Showing <strong className="text-white">{events.length}</strong> available event{events.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="min-h-[350px] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-3" />
          <p className="text-sm text-slate-400">Loading events...</p>
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-3xl bg-navy-900/50 border border-slate-800 space-y-4">
          <Calendar className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-xl font-bold text-white">No events match your criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms, changing the category, or clearing the price filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};

