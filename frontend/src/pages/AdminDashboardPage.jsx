import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatsCard } from '../components/StatsCard';
import {
  ShieldCheck,
  Users,
  Calendar,
  Ticket,
  DollarSign,
  QrCode,
  UserCheck,
  UserX,
  Sparkles,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Filter,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'events'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, eventsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminEvents(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users);
      if (eventsRes.success) setEvents(eventsRes.events);
    } catch (err) {
      setError(err.message || 'Failed to load administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await api.updateAdminUser(user._id, { status: newStatus });
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateAdminUser(userId, { role: newRole });
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to change user role.');
    }
  };

  const handleToggleFeatured = async (event) => {
    try {
      await api.updateAdminEventStatus(event._id, { featured: !event.featured });
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update event featured status.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event from the platform?')) return;
    try {
      await api.deleteEvent(eventId);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete event.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading administrator console...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Access Denied</h2>
        <p className="text-xs text-slate-400">{error || 'Admin credentials required.'}</p>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    if (userRoleFilter === 'all') return true;
    return u.role === userRoleFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Platform Administrator Console</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Admin Overview</h1>
        <p className="text-sm text-slate-400">
          Monitor platform-wide users, events, total ticketing volume, and moderation status.
        </p>
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Platform Users"
          value={stats.totalUsers}
          subtitle={`${stats.rolesBreakdown?.organizers || 0} organizers`}
          icon={Users}
          color="rose"
        />
        <StatsCard
          title="Total Events"
          value={stats.totalEvents}
          subtitle="Hosted platform-wide"
          icon={Calendar}
          color="purple"
        />
        <StatsCard
          title="Total Bookings"
          value={stats.totalBookings}
          subtitle="Confirmed transactions"
          icon={Ticket}
          color="emerald"
        />
        <StatsCard
          title="Gate Check-Ins"
          value={stats.totalCheckIns}
          subtitle="Atomic QR validations"
          icon={QrCode}
          color="cyan"
        />
        <StatsCard
          title="Platform GMV"
          value={`$${stats.totalRevenue}`}
          subtitle="Gross ticketing volume"
          icon={DollarSign}
          color="amber"
        />
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-glow-purple'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'events'
              ? 'bg-purple-600 text-white shadow-glow-purple'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Event Moderation ({events.length})
        </button>
      </div>

      {/* Tab 1: User Management */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Registered Users</h3>
              <p className="text-xs text-slate-400">View users, adjust permissions, or ban accounts</p>
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter role:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="py-1.5 px-3 rounded-xl bg-navy-950 border border-slate-700 text-slate-200 text-xs focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="attendee">Attendees Only</option>
                <option value="organizer">Organizers Only</option>
                <option value="admin">Administrators</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 px-4">Role</th>
                  <th className="pb-3 px-4">Phone</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Joined</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => {
                  const isSuspended = u.status === 'suspended';
                  return (
                    <tr key={u._id} className="hover:bg-navy-950/40 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <p className="font-bold text-white">{u.name}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="py-1 px-2 rounded-lg bg-navy-950 border border-slate-700 text-white font-semibold capitalize focus:outline-none"
                        >
                          <option value="attendee">Attendee</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{u.phone || '—'}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isSuspended
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            isSuspended
                              ? 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/30'
                              : 'bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-500/30'
                          }`}
                        >
                          {isSuspended ? 'Reactivate' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Event Moderation */}
      {activeTab === 'events' && (
        <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Platform Events Catalog</h3>
            <p className="text-xs text-slate-400">Manage visibility, feature spotlight events, or remove listings</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="pb-3 pr-4">Event</th>
                  <th className="pb-3 px-4">Organizer</th>
                  <th className="pb-3 px-4">Date</th>
                  <th className="pb-3 px-4">Capacity</th>
                  <th className="pb-3 px-4">Featured</th>
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
                          <span className="text-[10px] text-purple-400">{ev.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{ev.organizerName}</td>
                    <td className="py-3.5 px-4 text-slate-400">{ev.date}</td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {ev.registeredCount} / {ev.capacity}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(ev)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-all ${
                          ev.featured
                            ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                            : 'bg-navy-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>{ev.featured ? 'Featured' : 'Standard'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/events/${ev._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Open Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
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
      )}
    </div>
  );
};

