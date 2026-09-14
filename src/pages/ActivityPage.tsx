import React from 'react';
import { ActivityFeed } from '../components/activity/ActivityFeed';
import { DEMO_ACTIVITIES } from '../data/demoActivities';
import { ActivityFeedItem } from '../types/activity';
import { Activity, ShieldCheck, Radio, RefreshCw } from 'lucide-react';

interface ActivityPageProps {
  onNavigate: (tab: string) => void;
  onSelectHazardById?: (id: string) => void;
}

export const ActivityPage: React.FC<ActivityPageProps> = ({
  onNavigate,
  onSelectHazardById,
}) => {
  const handleSelectActivity = (item: ActivityFeedItem) => {
    if (item.category === 'sos_dispatch') {
      onNavigate('sos');
    } else if (item.category === 'radar_alert') {
      onNavigate('forecasts');
    } else if (item.category === 'shelter_update') {
      onNavigate('live-map');
    } else {
      onNavigate('hazards');
    }
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="font-extrabold text-base text-slate-900 font-mono uppercase tracking-wider">
              Real-Time Emergency Intelligence & Telemetry Feed
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Continuous Multi-Source Audit Stream: IMD • CWC • INCOIS • NDMA • SDMAs
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Multi-Agency Cryptographic Verification: Active</span>
        </div>
      </div>

      {/* Activity Feed Container */}
      <ActivityFeed
        activities={DEMO_ACTIVITIES}
        onSelectActivity={handleSelectActivity}
      />
    </div>
  );
};
