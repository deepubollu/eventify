import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Compass,
  PlusCircle,
  QrCode,
  LayoutDashboard,
  Ticket,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isOrganizer, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-navy-950/80 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 via-accent-violet to-indigo-500 p-0.5 shadow-glow-purple transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-300 bg-clip-text text-transparent">
                Eventify<span className="text-purple-500">.</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold -mt-1">
                Event Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/events"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/events')
                  ? 'text-white bg-purple-600/20 border border-purple-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Compass className="w-4 h-4 text-purple-400" />
              Explore Events
            </Link>

            {isAuthenticated && (
              <Link
                to="/my-bookings"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/my-bookings')
                    ? 'text-white bg-purple-600/20 border border-purple-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Ticket className="w-4 h-4 text-purple-400" />
                My Bookings
              </Link>
            )}

            {isOrganizer && (
              <>
                <Link
                  to="/create-event"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/create-event')
                      ? 'text-white bg-purple-600/20 border border-purple-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-accent-emerald" />
                  Create Event
                </Link>

                <Link
                  to="/verify-ticket"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/verify-ticket')
                      ? 'text-white bg-purple-600/20 border border-purple-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-accent-cyan" />
                  QR Scanner
                </Link>

                <Link
                  to="/organizer-dashboard"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/organizer-dashboard')
                      ? 'text-white bg-purple-600/20 border border-purple-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-purple-400" />
                  Dashboard
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin-dashboard"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/admin-dashboard')
                    ? 'text-white bg-rose-500/20 border border-rose-500/30'
                    : 'text-rose-300 hover:text-rose-100 hover:bg-rose-950/30'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Right Action / Auth Button */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-full border border-slate-700/60 bg-navy-900/60 hover:border-purple-500/50 transition-all focus:outline-none"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover border border-purple-500/40"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-white leading-tight">{user?.name}</p>
                    <span className="text-[10px] text-purple-400 capitalize">{user?.role}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-navy-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-800">
                      <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 capitalize">
                        {user?.role} account
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <User className="w-4 h-4 text-purple-400" />
                      My Profile
                    </Link>

                    <Link
                      to="/my-bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-purple-400" />
                      My Bookings
                    </Link>

                    {isOrganizer && (
                      <Link
                        to="/organizer-dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-purple-400" />
                        Organizer Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/60 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-glow-purple transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-navy-900/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-2">
          {isAuthenticated && (
            <div className="flex items-center gap-3 p-3 bg-navy-950/70 rounded-xl border border-slate-800 mb-3">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover border border-purple-500"
              />
              <div>
                <p className="font-semibold text-white text-sm">{user?.name}</p>
                <p className="text-xs text-purple-400 capitalize">{user?.role} Account</p>
              </div>
            </div>
          )}

          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800"
          >
            <Compass className="w-5 h-5 text-purple-400" />
            Explore Events
          </Link>

          {isAuthenticated && (
            <Link
              to="/my-bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800"
            >
              <Ticket className="w-5 h-5 text-purple-400" />
              My Bookings
            </Link>
          )}

          {isOrganizer && (
            <>
              <Link
                to="/create-event"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800"
              >
                <PlusCircle className="w-5 h-5 text-accent-emerald" />
                Create Event
              </Link>
              <Link
                to="/verify-ticket"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800"
              >
                <QrCode className="w-5 h-5 text-accent-cyan" />
                QR Scanner
              </Link>
              <Link
                to="/organizer-dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800"
              >
                <LayoutDashboard className="w-5 h-5 text-purple-400" />
                Dashboard
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              to="/admin-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-300 hover:bg-rose-950/40"
            >
              <ShieldCheck className="w-5 h-5 text-rose-400" />
              Admin Panel
            </Link>
          )}

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white"
              >
                <User className="w-5 h-5 text-purple-400" />
                Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 text-rose-400 hover:text-rose-300 text-left"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-slate-700 text-white font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-purple-600 text-white font-semibold"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

