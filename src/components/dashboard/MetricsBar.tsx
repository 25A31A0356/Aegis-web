import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Radio, PhoneCall, MapPin, Building2, Flame, Droplets, CheckCircle } from 'lucide-react';
import { HazardService } from '../../services/hazardService';
import { DEMO_STATES } from '../../data/demoStates';
import { useSOS } from '../../context/SOSContext';

interface MetricsBarProps {
  onNavigate?: (tab: string) => void;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ onNavigate }) => {
  const { beacons } = useSOS();
  const [metricsSummary, setMetricsSummary] = useState(() => HazardService.getMetricsSummary());

  useEffect(() => {
    HazardService.fetchLiveHazards().then(() => {
      setMetricsSummary(HazardService.getMetricsSummary());
    }).catch(console.error);

    const unsubscribe = HazardService.subscribe(() => {
      setMetricsSummary(HazardService.getMetricsSummary());
    });
    return unsubscribe;
  }, []);

  const criticalHazards = metricsSummary.criticalHazards;
  const warningHazards = metricsSummary.warningHazards;
  const totalHazards = metricsSummary.totalHazards;
  const criticalStates = DEMO_STATES.filter((s) => s.riskLevel === 'critical' || s.riskLevel === 'warning').length;
  const activeSOS = beacons.filter((b) => b.triageStatus !== 'resolved' && b.triageStatus !== 'cancelled').length;

  const metrics = [
    {
      label: 'Active Multi-Hazards',
      value: `${String(totalHazards).padStart(2, '0')}`,
      subtext: `${criticalHazards} Critical • ${warningHazards} Warnings`,
      icon: AlertTriangle,
      color: 'text-slate-900',
      badge: 'MONITORED',
      badgeColor: 'bg-slate-100 text-slate-700',
      tab: 'hazards',
    },
    {
      label: 'Critical Red Alerts',
      value: `${String(criticalHazards).padStart(2, '0')}`,
      subtext: 'Cyclone Vayu, Wayanad, Assam',
      icon: ShieldAlert,
      color: 'text-red-600',
      badge: 'IMMEDIATE ACTION',
      badgeColor: 'bg-red-100 text-red-700 font-bold',
      tab: 'hazards',
    },
    {
      label: 'Active Citizen SOS Beacons',
      value: `${String(activeSOS).padStart(2, '0')}`,
      subtext: 'Khammam, Mumbai, Wayanad, Delhi',
      icon: PhoneCall,
      color: 'text-red-600',
      badge: 'DISPATCH LIVE',
      badgeColor: 'bg-red-600 text-white font-bold',
      tab: 'sos',
    },
    {
      label: 'National Forecast Index',
      value: 'MODERATE',
      subtext: 'Monsoon Depression Active (68/100)',
      icon: Radio,
      color: 'text-amber-600',
      badge: 'IMD MODEL',
      badgeColor: 'bg-amber-100 text-amber-800',
      tab: 'forecasts',
    },
    {
      label: 'Elevated Risk States',
      value: `${String(criticalStates).padStart(2, '0')}`,
      subtext: 'Odisha, Kerala, Assam, TS, MH, HP',
      icon: MapPin,
      color: 'text-slate-900',
      badge: '28 STATES / 8 UT',
      badgeColor: 'bg-slate-100 text-slate-700',
      tab: 'live-map',
    },
    {
      label: 'Designated Safe Shelters',
      value: '100%',
      subtext: 'Relief Camps & NDRF Bases Active',
      icon: Building2,
      color: 'text-emerald-600',
      badge: 'OPERATIONAL',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      tab: 'live-map',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-sans">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            onClick={() => onNavigate && onNavigate(m.tab)}
            className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-card hover:border-slate-300 hover:shadow-elevated transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${m.badgeColor}`}>
                {m.badge}
              </span>
              <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
            </div>
            <div className={`text-2xl font-extrabold font-mono tracking-tight ${m.color}`}>
              {m.value}
            </div>
            <div className="text-xs font-semibold text-slate-800 mt-0.5 line-clamp-1">
              {m.label}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1 line-clamp-1">
              {m.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
