import React from 'react';
import {
  CloudRain,
  Wind,
  Flame,
  Activity,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { HazardItem } from '../../types/hazard';

interface RecentAlertsCardProps {
  hazards: HazardItem[];
  onSelectHazard?: (id: string) => void;
  onViewAll?: () => void;
}

export const RecentAlertsCard: React.FC<RecentAlertsCardProps> = ({
  hazards,
  onSelectHazard,
  onViewAll,
}) => {
  const getHazardIcon = (category: string) => {
    switch (category) {
      case 'cyclone':
        return <Wind className="w-4 h-4 text-[#075B8A]" />;
      case 'flood':
      case 'flash_flood':
        return <CloudRain className="w-4 h-4 text-[#075B8A]" />;
      case 'heatwave':
        return <Flame className="w-4 h-4 text-[#E94B68]" />;
      case 'earthquake':
        return <Activity className="w-4 h-4 text-[#075B8A]" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-[#F4C84A]" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-[#FEF1F3] text-[#E94B68] border-[#FDC8D1]';
      case 'warning':
        return 'bg-[#FFFBF0] text-[#B78809] border-[#FDE8A4]';
      default:
        return 'bg-[#EDFAFC] text-[#075B8A] border-[#AEEBF0]';
    }
  };

  const displayList = hazards.slice(0, 3);

  return (
    <div className="bg-white rounded-[24px] border border-[#DCEBED] p-5 sm:p-6 shadow-card flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCEBED]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#075B8A]">
            RECENT ALERTS
          </span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#EDFAFC] text-[#075B8A]">
            {hazards.length} ACTIVE
          </span>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-[#075B8A] hover:text-[#0B6E9E] flex items-center gap-0.5 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Alerts Stack */}
      <div className="space-y-2.5">
        {displayList.map((alert) => (
          <div
            key={alert.id}
            onClick={() => onSelectHazard && onSelectHazard(alert.id)}
            className="group flex items-start justify-between gap-3 p-3 rounded-2xl bg-[#F4F8FA] hover:bg-[#EEF5F8] border border-[#DCEBED] hover:border-[#18C3D0] transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#DCEBED] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                {getHazardIcon(alert.category)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#18364A] group-hover:text-[#075B8A] transition-colors line-clamp-1">
                  {alert.title}
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-[#708696] font-medium mt-0.5">
                  <span className="font-semibold text-[#18364A]">
                    {alert.location.city || alert.location.district}, {alert.location.state}
                  </span>
                  <span>•</span>
                  <span>{alert.source.publishedAt || '12m ago'}</span>
                </div>
              </div>
            </div>

            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border shrink-0 ${getSeverityBadge(
                alert.severity
              )}`}
            >
              {alert.severity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
