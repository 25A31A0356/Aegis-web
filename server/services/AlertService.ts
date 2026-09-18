/**
 * AGIES ALERT - Backend AlertService
 * Aggregates multi-hazard alerts from IMD, CWC, NDMA, and regional SDMAs.
 */

import { AlertQueryFilter } from '../types/api';

export interface AlertItem {
  id: string;
  title: string;
  category: string;
  severity: 'critical' | 'warning' | 'moderate' | 'minor';
  status: 'active' | 'monitoring' | 'resolved';
  headline: string;
  description: string;
  location: {
    state: string;
    district: string;
    coordinates: [number, number];
    radiusKm: number;
  };
  source: {
    agency: string;
    bulletinId: string;
    publishedAt: string;
    validUntil: string;
  };
  recommendedAction: string;
  safetyGuideSlug?: string;
}

export class AlertService {
  private static alerts: AlertItem[] = [
    {
      id: 'ALT-IMD-2026-0891',
      title: 'Red Warning: Severe Convective Rainfall & Urban Inundation',
      category: 'flood',
      severity: 'critical',
      status: 'active',
      headline: 'Extreme precipitation (>115 mm/hr) detected over coastal belt with severe waterlogging risk.',
      description: 'IMD Doppler Radar indicates deep cumulonimbus cell movement along low-lying drainage catchments.',
      location: {
        state: 'Maharashtra',
        district: 'Mumbai Suburban',
        coordinates: [19.0760, 72.8777],
        radiusKm: 35,
      },
      source: {
        agency: 'India Meteorological Department (IMD)',
        bulletinId: 'IMD-BULL-0891',
        publishedAt: new Date(Date.now() - 15 * 60000).toISOString(),
        validUntil: new Date(Date.now() + 6 * 3600000).toISOString(),
      },
      recommendedAction: 'Move to higher ground. Avoid low-lying subways and flooded underpasses.',
      safetyGuideSlug: 'floods',
    },
    {
      id: 'ALT-CWC-2026-0412',
      title: 'Orange Alert: Godavari River Basin Level Exceeding Danger Mark',
      category: 'flood',
      severity: 'warning',
      status: 'active',
      headline: 'Inflow at upstream barrages rising at 18 cm/hr; low-lying banks under active watch.',
      description: 'Central Water Commission hydro-sensors confirm rapid water level rise across downstream sectors.',
      location: {
        state: 'Telangana',
        district: 'Bhadradri Kothagudem',
        coordinates: [17.5500, 80.6200],
        radiusKm: 60,
      },
      source: {
        agency: 'Central Water Commission (CWC)',
        bulletinId: 'CWC-HYD-0412',
        publishedAt: new Date(Date.now() - 45 * 60000).toISOString(),
        validUntil: new Date(Date.now() + 12 * 3600000).toISOString(),
      },
      recommendedAction: 'Evacuate riverbank settlements to designated high-elevation relief shelters.',
      safetyGuideSlug: 'floods',
    },
    {
      id: 'ALT-IMD-2026-0774',
      title: 'Cyclone Watch: Severe Tropical Storm System Formulating',
      category: 'cyclone',
      severity: 'critical',
      status: 'active',
      headline: 'Deep depression over Bay of Bengal intensifies with squally winds up to 95 km/h.',
      description: 'Cyclone track projection indicates landfall trajectory towards Odisha coastline in 36 hours.',
      location: {
        state: 'Odisha',
        district: 'Puri',
        coordinates: [19.8135, 85.8312],
        radiusKm: 120,
      },
      source: {
        agency: 'IMD Cyclone Warning Division',
        bulletinId: 'IMD-CYC-0774',
        publishedAt: new Date(Date.now() - 75 * 60000).toISOString(),
        validUntil: new Date(Date.now() + 24 * 3600000).toISOString(),
      },
      recommendedAction: 'Complete rooftop reinforcement. Fishermen strictly advised not to venture into open seas.',
      safetyGuideSlug: 'cyclones',
    },
    {
      id: 'ALT-NCS-2026-0105',
      title: 'Moderate Seismic Tremor (M4.8) Recorded',
      category: 'earthquake',
      severity: 'warning',
      status: 'monitoring',
      headline: 'Shallow focal depth of 12 km recorded; light structural vibration felt across valley.',
      description: 'National Center for Seismology confirms M4.8 tremor with no major aftershocks currently detected.',
      location: {
        state: 'Assam',
        district: 'Kamrup Metropolitan',
        coordinates: [26.1445, 91.7362],
        radiusKm: 45,
      },
      source: {
        agency: 'National Center for Seismology (NCS)',
        bulletinId: 'NCS-EQ-0105',
        publishedAt: new Date(Date.now() - 120 * 60000).toISOString(),
        validUntil: new Date(Date.now() + 48 * 3600000).toISOString(),
      },
      recommendedAction: 'Inspect structures for major hairline cracks. Review Drop, Cover & Hold protocol.',
      safetyGuideSlug: 'earthquakes',
    },
  ];

  /**
   * Get all active alerts with optional query filtering
   */
  public static async getAlerts(filter?: AlertQueryFilter): Promise<AlertItem[]> {
    let result = [...this.alerts];
    if (!filter) return result;

    if (filter.category && filter.category !== 'all') {
      result = result.filter((a) => a.category.toLowerCase() === filter.category?.toLowerCase());
    }
    if (filter.severity && filter.severity !== 'all') {
      result = result.filter((a) => a.severity.toLowerCase() === filter.severity?.toLowerCase());
    }
    if (filter.stateId) {
      result = result.filter((a) => a.location.state.toLowerCase().includes(filter.stateId!.toLowerCase()));
    }
    return result;
  }

  /**
   * Get alerts near specified geographic coordinates
   */
  public static async getNearbyAlerts(lat: number, lng: number, radiusKm: number = 100): Promise<AlertItem[]> {
    return this.alerts.filter((a) => {
      const dist = this.calculateDistanceKm([lat, lng], a.location.coordinates);
      return dist <= (radiusKm || a.location.radiusKm);
    });
  }

  private static calculateDistanceKm(c1: [number, number], c2: [number, number]): number {
    const [lat1, lon1] = c1;
    const [lat2, lon2] = c2;
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
  }
}
