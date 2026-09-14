import React from 'react';
import { Globe, Map, Navigation } from 'lucide-react';
import { GeoScope } from '../../types/location';

interface GeoScopeSelectorProps {
  scope: GeoScope;
  setScope: (scope: GeoScope) => void;
}

export const GeoScopeSelector: React.FC<GeoScopeSelectorProps> = ({ scope, setScope }) => {
  const options = [
    { id: 'india' as const, label: 'India National Grid', icon: Map, badge: 'High Density' },
    { id: 'asia' as const, label: 'South & East Asia', icon: Navigation },
    { id: 'global' as const, label: 'Worldwide Watch', icon: Globe },
  ];

  return (
    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = scope === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => setScope(opt.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
            <span>{opt.label}</span>
            {opt.badge && (
              <span className="hidden sm:inline text-[9px] font-mono bg-sky-100 text-sky-800 px-1 rounded">
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
