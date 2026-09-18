import { CITY_COORDINATES } from './weatherService';
import { DEMO_STATES } from '../data/demoStates';
import { ExportDataPayload } from './exportService';

export interface AnalyticsFilterState {
  location: string;
  hazard: string;
  dateRange: string;
}

export interface AnalyticsResult {
  stats: {
    peakIntensity: string;
    peakIntensityLabel: string;
    totalEvents: number;
    activeEvents: number;
    peopleAffected: string;
    peopleAffectedExact: number;
    trend: string;
    trendPositive: boolean;
    trendSubtext: string;
  };
  timeline: Array<{
    date: string;
    intensityIndex: number;
    peopleAffected: number;
    alertCount: number;
    baseline: number;
  }>;
  severityDistribution: Array<{
    name: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  regionalImpact: Array<{
    region: string;
    events: number;
    affected: number;
    severity: 'critical' | 'warning' | 'moderate' | 'minor';
    riskScore: number;
  }>;
  isLiveData: boolean;
  generatedTimestamp: string;
}

export class AnalyticsService {
  /**
   * Generates dynamic, coherent hazard analytics responding to filter state
   */
  public static getAnalyticsData(filter: AnalyticsFilterState): AnalyticsResult {
    const { location, hazard, dateRange } = filter;
    const now = new Date();

    // 1. Multipliers based on hazard type
    let baseIntensity = 'Cat-4 (185 km/h)';
    let baseIntensityLabel = 'Peak Cyclone Gusts';
    let baseEvents = 38;
    let baseAffected = 2400000;
    let trend = '+14% vs Previous Period';
    let trendPositive = true;

    if (hazard === 'flood') {
      baseIntensity = '142 mm / hr';
      baseIntensityLabel = 'Max Inundation Rate';
      baseEvents = 52;
      baseAffected = 1850000;
      trend = '+22% Inundation Velocity';
    } else if (hazard === 'earthquake') {
      baseIntensity = 'M6.2 Richter';
      baseIntensityLabel = 'Max Seismic Magnitude';
      baseEvents = 14;
      baseAffected = 420000;
      trend = '-8% Seismic Frequency';
      trendPositive = false;
    } else if (hazard === 'heatwave') {
      baseIntensity = '44.8°C Ambient';
      baseIntensityLabel = 'Peak Thermal Dome';
      baseEvents = 29;
      baseAffected = 3100000;
      trend = '+18% Thermal Index';
    } else if (hazard === 'landslide') {
      baseIntensity = 'High Slip Rate';
      baseIntensityLabel = 'Geological Debris Vector';
      baseEvents = 19;
      baseAffected = 120000;
      trend = '+9% Saturated Slope Area';
    }

    // 2. Adjustments based on location
    let locMultiplier = 1.0;
    if (location !== 'all' && location !== 'india') {
      locMultiplier = 0.45;
      baseEvents = Math.round(baseEvents * 0.4);
      baseAffected = Math.round(baseAffected * 0.35);
    }

    // 3. Adjustments based on date range
    let pointsCount = 7;
    let dateLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

    if (dateRange === '24h') {
      pointsCount = 6;
      dateLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', 'Now'];
    } else if (dateRange === '30d') {
      pointsCount = 6;
      dateLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Recent'];
      baseEvents = Math.round(baseEvents * 2.8);
      baseAffected = Math.round(baseAffected * 2.4);
    } else if (dateRange === '90d' || dateRange === 'ytd') {
      pointsCount = 6;
      dateLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      baseEvents = Math.round(baseEvents * 6.5);
      baseAffected = Math.round(baseAffected * 5.2);
    }

    // Formatted affected string
    const formatAffected = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      return String(num);
    };

    // 4. Timeline time-series generation
    const timeline = dateLabels.map((lbl, idx) => {
      const curve = Math.sin((idx / pointsCount) * Math.PI) * 25 + 50;
      const noise = ((idx * 7) % 15) - 7;
      const intensity = Math.min(100, Math.max(20, Math.round(curve + noise)));
      const affected = Math.round((baseAffected / pointsCount) * (0.8 + (idx / pointsCount) * 0.4));
      const alerts = Math.max(1, Math.round((baseEvents / pointsCount) * (0.7 + (idx / pointsCount) * 0.6)));

      return {
        date: lbl,
        intensityIndex: intensity,
        peopleAffected: affected,
        alertCount: alerts,
        baseline: 40,
      };
    });

    // 5. Severity Distribution
    const severityDistribution = [
      { name: 'Critical (Red)', count: Math.round(baseEvents * 0.35), percentage: 35, color: '#E94B68' },
      { name: 'Warning (Amber)', count: Math.round(baseEvents * 0.4), percentage: 40, color: '#F4C84A' },
      { name: 'Moderate (Cyan)', count: Math.round(baseEvents * 0.18), percentage: 18, color: '#18C3D0' },
      { name: 'Minor (Green)', count: Math.round(baseEvents * 0.07), percentage: 7, color: '#45C79A' },
    ];

    // 6. Regional Impact
    const regions = [
      { region: 'Odisha Coastal Belt', events: 14, affected: 850000, severity: 'critical' as const, riskScore: 88 },
      { region: 'Andhra Pradesh (North)', events: 11, affected: 620000, severity: 'critical' as const, riskScore: 82 },
      { region: 'West Bengal Delta', events: 9, affected: 480000, severity: 'warning' as const, riskScore: 74 },
      { region: 'Maharashtra (Konkan)', events: 7, affected: 290000, severity: 'warning' as const, riskScore: 68 },
      { region: 'Assam Valley', events: 5, affected: 160000, severity: 'moderate' as const, riskScore: 56 },
    ];

    return {
      stats: {
        peakIntensity: baseIntensity,
        peakIntensityLabel: baseIntensityLabel,
        totalEvents: baseEvents,
        activeEvents: Math.round(baseEvents * 0.3),
        peopleAffected: formatAffected(baseAffected),
        peopleAffectedExact: baseAffected,
        trend,
        trendPositive,
        trendSubtext: 'Compared to historical 3-year baseline',
      },
      timeline,
      severityDistribution,
      regionalImpact: regions,
      isLiveData: true,
      generatedTimestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
    };
  }

  /**
   * Helper to format export payload
   */
  public static createExportPayload(filter: AnalyticsFilterState, result: AnalyticsResult): ExportDataPayload {
    return {
      title: 'AGIES ALERT - Hazard Analytics Briefing',
      subtitle: 'Intensity, severity and regional impact insights for selected hazards.',
      generatedAt: result.generatedTimestamp,
      location: filter.location === 'all' ? 'National Overview (India)' : filter.location.toUpperCase(),
      hazard: filter.hazard.toUpperCase(),
      dateRange: filter.dateRange.toUpperCase(),
      stats: {
        peakIntensity: result.stats.peakIntensity,
        totalEvents: result.stats.totalEvents,
        peopleAffected: result.stats.peopleAffected,
        trend: result.stats.trend,
      },
      timeline: result.timeline,
      regionalImpact: result.regionalImpact,
      severityDistribution: result.severityDistribution.map((s) => ({
        name: s.name,
        value: s.count,
        color: s.color,
      })),
    };
  }
}
