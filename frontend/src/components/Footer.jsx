import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Heart, Shield, Sparkles, Github, Twitter, Linkedin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-navy-950 text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Eventify<span className="text-purple-500">.</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              The modern event management & digital ticketing platform. Empowering creators to host unforgettable experiences with real-time QR verification.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <a href="#github" className="p-2 rounded-lg bg-navy-900 border border-slate-800 hover:text-white hover:border-purple-500/50 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#twitter" className="p-2 rounded-lg bg-navy-900 border border-slate-800 hover:text-white hover:border-purple-500/50 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#linkedin" className="p-2 rounded-lg bg-navy-900 border border-slate-800 hover:text-white hover:border-purple-500/50 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Discover Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Explore Events</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/events?category=Technology" className="hover:text-purple-400 transition-colors">Technology & AI</Link></li>
              <li><Link to="/events?category=Music+%26+Concerts" className="hover:text-purple-400 transition-colors">Concerts & Music</Link></li>
              <li><Link to="/events?category=Workshops+%26+Education" className="hover:text-purple-400 transition-colors">Developer Workshops</Link></li>
              <li><Link to="/events?category=Business+%26+Networking" className="hover:text-purple-400 transition-colors">Business & Pitch Nights</Link></li>
              <li><Link to="/events?priceType=free" className="hover:text-purple-400 transition-colors">Free Events</Link></li>
            </ul>
          </div>

          {/* Organizers */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">For Organizers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/create-event" className="hover:text-purple-400 transition-colors">Host an Event</Link></li>
              <li><Link to="/verify-ticket" className="hover:text-purple-400 transition-colors">QR Ticket Scanner</Link></li>
              <li><Link to="/organizer-dashboard" className="hover:text-purple-400 transition-colors">Analytics Dashboard</Link></li>
              <li><Link to="/login" className="hover:text-purple-400 transition-colors">Organizer Login</Link></li>
            </ul>
          </div>

          {/* Platform status & Trust */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Platform Health</h4>
            <div className="p-4 rounded-xl bg-navy-900/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Systems Fully Operational
              </div>
              <p className="text-xs text-slate-400">
                Encrypted JWT sessions, atomic ticket QR verification, and real-time live attendance analytics.
              </p>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>TLS 1.3 & SHA-256 Verifiable Check-ins</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Eventify Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for modern event creators and attendees.
          </p>
        </div>
      </div>
    </footer>
  );
};

