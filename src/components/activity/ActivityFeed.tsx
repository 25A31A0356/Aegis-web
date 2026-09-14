import React, { useState } from 'react';
import { ActivityFeedItem, ActivityCategory, ActivityScope } from '../../types/activity';
import { ActivityItem } from './ActivityItem';
import { Search, Filter, Radio, Sparkles, RefreshCw } from 'lucide-react';

interface ActivityFeedProps {
  activities: ActivityFeedItem[];
  onSelectActivity?: (item: ActivityFeedItem) => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, onSelectActivity }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeFilter, setScopeFilter] = useState<ActivityScope | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filtered = activities.filter((item) => {
    if (scopeFilter !== 'all' && item.scope !== scopeFilter) return false;
    if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.locationTag.toLowerCase().includes(q) ||
        item.sourceAgency.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 font-sans">
      {/* Feed Controls Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search activity stream by agency, location, or keyword..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Scope */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
            {(['all', 'india', 'global'] as const).map((sc) => (
              <button
                key={sc}
                onClick={() => setScopeFilter(sc)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-colors ${
                  scopeFilter === sc ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                {sc}
              </button>
            ))}
          </div>

          {/* Severity */}
          <div className="flex items-center gap-1 font-mono text-[10px]">
            {(['all', 'critical', 'warning'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-1 rounded font-bold capitalize ${
                  severityFilter === sev
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <ActivityItem
            key={item.id}
            item={item}
            onClick={onSelectActivity}
          />
        ))}
      </div>
    </div>
  );
};
