import React from 'react';

export const StatsCard = ({ title, value, subtitle, icon: Icon, color = 'purple', delta }) => {
  const colorStyles = {
    purple: {
      bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      badge: 'text-purple-300',
    },
    emerald: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      badge: 'text-emerald-300',
    },
    cyan: {
      bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
      badge: 'text-cyan-300',
    },
    amber: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      badge: 'text-amber-300',
    },
    rose: {
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      badge: 'text-rose-300',
    },
  };

  const currentStyle = colorStyles[color] || colorStyles.purple;

  return (
    <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 backdrop-blur-md relative overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl border ${currentStyle.bg}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      {(subtitle || delta) && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{subtitle}</span>
          {delta && <span className={`font-semibold ${currentStyle.badge}`}>{delta}</span>}
        </div>
      )}
    </div>
  );
};

