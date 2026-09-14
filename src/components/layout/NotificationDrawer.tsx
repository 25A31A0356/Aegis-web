import React, { useState } from 'react';
import { X, Bell, AlertTriangle, Info, CheckCheck, Trash2, ChevronRight, ShieldAlert } from 'lucide-react';
import { useNotifications, AlertNotification } from '../../context/NotificationContext';

interface NotificationDrawerProps {
  onNavigate: (tab: string) => void;
  onSelectHazard?: (hazardId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  onNavigate,
  onSelectHazard,
}) => {
  const {
    notifications,
    unreadCount,
    isDrawerOpen,
    setIsDrawerOpen,
    markAsRead,
    markAllAsRead,
    clearNotification,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  if (!isDrawerOpen) return null;

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.severity === activeFilter;
  });

  const handleItemClick = (notif: AlertNotification) => {
    markAsRead(notif.id);
    setIsDrawerOpen(false);
    if (notif.hazardId && onSelectHazard) {
      onSelectHazard(notif.hazardId);
    }
    if (notif.linkTab) {
      onNavigate(notif.linkTab);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Safety Broadcasts & Alerts</h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  {unreadCount} Unacknowledged Notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Chips & Mark All Read */}
          <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              {(['all', 'critical', 'warning', 'info'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors ${
                    activeFilter === filter
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                No active notifications under this filter.
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`pt-3 first:pt-0 p-3 rounded-xl border transition-all cursor-pointer ${
                    !item.read
                      ? 'bg-slate-50/80 border-slate-200 shadow-xs'
                      : 'bg-white border-transparent hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                          item.severity === 'critical'
                            ? 'bg-red-600 animate-pulse'
                            : item.severity === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-sky-500'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{item.title}</span>
                          {!item.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {item.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-mono">
                          <span>{item.location}</span>
                          <span>•</span>
                          <span>{item.source}</span>
                          <span>•</span>
                          <span className="text-slate-400">{item.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotification(item.id);
                      }}
                      className="text-slate-300 hover:text-red-500 p-1"
                      title="Dismiss"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span className="font-mono text-[11px]">DISASTER CELL DISPATCH</span>
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                onNavigate('activity');
              }}
              className="text-xs font-semibold text-slate-800 hover:text-red-600 flex items-center gap-1"
            >
              View Full Activity Log <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
