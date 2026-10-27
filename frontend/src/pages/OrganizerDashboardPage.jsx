import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { StatsCard } from '../components/StatsCard';
import {
  Calendar,
  Users,
  Ticket,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  QrCode,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
  PieChart as PieIcon,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#6366F1'];

export const OrganizerDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getOrganizerDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This will permanently cancel registrations.')) return;
    try {
      await api.deleteEvent(eventId);
      fetchDashboard();
    } catch (err) {
      alert(err.message || 'Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading organizer intelligence dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Dashboard Unavailable</h2>
        <p className="text-xs text-slate-400">{error || 'Please log in as an organizer or admin.'}</p>
      </div>
    );
  }

  const { stats, charts, recentBookings, upcomingEvents, events } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Event Management & Analytics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Organizer Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Real-time event performance, ticket velocity, and gate check-in ratios.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/verify-ticket"
            className="px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 hover:border-purple-500 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <QrCode className="w-4 h-4 text-accent-cyan" />
            <span>QR Gate Scanner</span>
          </Link>
          <Link
            to="/create-event"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow-purple flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Event</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Events"
          value={stats.totalEvents}
          subtitle="Active & published"
          icon={Calendar}
          color="purple"
        />
        <StatsCard
          title="Registrations"
          value={stats.totalRegistrations}
          subtitle="Confirmed orders"
          icon={Users}
          color="emerald"
        />
        <StatsCard
          title="Tickets Sold"
          value={stats.totalTicketsSold}
          subtitle="Issued passes"
          icon={Ticket}
          color="cyan"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${stats.totalRevenue}`}
          subtitle="Platform ticket sales"
          icon={DollarSign}
          color="amber"
        />
        <StatsCard
          title="Check-In Rate"
          value={`${stats.attendanceRate}%`}
          subtitle={`${stats.totalCheckedIn} checked in`}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Charts Section (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Chart 1: Event Capacity vs Registered (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-navy-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span>Event Registrations vs Capacity</span>
              </h3>
              <p className="text-xs text-slate-400">Comparison of registered attendees to venue capacity</p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.eventCapacityChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="registered" name="Registered" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="capacity" name="Capacity" fill="#334155" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Breakdown (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-navy-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-accent-cyan" />
              <span>Category Distribution</span>
            </h3>
            <p className="text-xs text-slate-400">Events organized across categories</p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.categoryChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.categoryChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3: Registration Trends Over Time */}
      <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Registration Trajectory Over Time</span>
          </h3>
          <p className="text-xs text-slate-400">Aggregate ticket bookings across dates</p>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={charts.registrationTrends}>
              <defs>
                <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="registrations"
                name="Registrations"
                stroke="#8B5CF6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReg)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Events Management Table */}
      <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">My Managed Events</h3>
            <p className="text-xs text-slate-400">Manage, edit, or check in attendees for your events</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{events.length} Events Total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="pb-3 pr-4">Event</th>
                <th className="pb-3 px-4">Date & Time</th>
                <th className="pb-3 px-4">Price</th>
                <th className="pb-3 px-4">Capacity</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {events.map((ev) => (
                <tr key={ev._id} className="hover:bg-navy-950/40 transition-colors">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={ev.image}
                        alt={ev.title}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-800"
                      />
                      <div>
                        <p className="font-bold text-white line-clamp-1">{ev.title}</p>
                        <p className="text-[11px] text-purple-400">{ev.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {ev.date} • {ev.time}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {ev.ticketPrice === 0 ? 'Free' : `$${ev.ticketPrice}`}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {ev.registeredCount} / {ev.capacity}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      {ev.status}
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/events/${ev._id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/edit-event/${ev._id}`}
                        className="p-1.5 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 transition-colors"
                        title="Edit Event"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(ev._id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Bookings Feed */}
      <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white">Recent Attendee Bookings</h3>
          <p className="text-xs text-slate-400">Live feed of reservations across your events</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="pb-3 pr-4">Booking Ref</th>
                <th className="pb-3 px-4">Attendee</th>
                <th className="pb-3 px-4">Event</th>
                <th className="pb-3 px-4">Amount</th>
                <th className="pb-3 px-4">Date</th>
                <th className="pb-3 pl-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentBookings.map((b) => (
                <tr key={b._id} className="hover:bg-navy-950/40 transition-colors">
                  <td className="py-3 pr-4 font-mono font-semibold text-purple-400">
                    {b.bookingReference}
                  </td>
                  <td className="py-3 px-4 text-white font-medium">
                    {b.attendeeDetails?.name}
                    <span className="block text-[10px] text-slate-400">{b.attendeeDetails?.email}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 truncate max-w-[200px]">
                    {b.event?.title || 'Event'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    {b.totalAmount === 0 ? 'Free' : `$${b.totalAmount}`}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      {b.bookingStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

