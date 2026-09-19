/**
 * AEGIS ALERT - Centralized Activity & Event Synchronization Service
 * Interfaces with Aegis API GET /api/v1/activity and syncs with RealtimeService
 * to provide a live, deduplicated stream of multi-agency bulletins and community incident reports.
 */

import { ApiClient } from './apiClient';
import { RealtimeService, RealtimeEvent } from './realtimeService';
import { ActivityFeedItem, ActivityCategory } from '../types/activity';
import { DEMO_ACTIVITIES } from '../data/demoActivities';

const STORAGE_CACHE_KEY = 'aegis_activity_cache';

class ActivityServiceSingleton {
  private activities: ActivityFeedItem[] = [];
  private subscribers: Set<(activities: ActivityFeedItem[]) => void> = new Set();
  private isInitialized = false;

  constructor() {
    this.loadFromCache();
    this.setupRealtimeListeners();
  }

  private loadFromCache(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const cached = localStorage.getItem(STORAGE_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.activities = parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  private saveToCache(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(this.activities.slice(0, 50)));
    } catch {
      // ignore
    }
  }

  private setupRealtimeListeners(): void {
    RealtimeService.on('REPORT_CREATED', (evt: RealtimeEvent) => {
      const report = evt.data;
      if (!report) return;

      const newActivity: ActivityFeedItem = {
        id: report.id || `rep-${Date.now()}`,
        timestamp: report.submittedAt || evt.timestamp || new Date().toISOString(),
        relativeTime: 'Just now',
        category: 'incident_detected',
        scope: 'india',
        title: report.title || `Citizen Incident: ${report.hazardType || 'Hazard'} Reported`,
        description: report.description || 'Community incident telemetry received and dispatched to regional operations.',
        severity: report.severity === 'critical' ? 'critical' : report.severity === 'high' ? 'warning' : 'moderate',
        sourceAgency: 'Citizen Intelligence Network',
        locationTag: `${report.location?.city || 'Local Sector'}, ${report.location?.state || 'India'}`,
        coordinates: report.location?.lat && report.location?.lng ? [report.location.lat, report.location.lng] : undefined,
        metricsBadge: report.status === 'verified' ? 'Verified by Ops' : report.status === 'dispatched' ? 'Unit Dispatched' : 'Pending Verification',
        isVerified: report.status === 'verified' || report.status === 'dispatched',
        actionUrl: `/live-map?reportId=${report.trackingId || report.id}`,
      };

      this.prependActivity(newActivity);
    });

    RealtimeService.on('ALERT_UPDATED', (evt: RealtimeEvent) => {
      const alert = evt.data;
      if (!alert) return;

      const newActivity: ActivityFeedItem = {
        id: alert.id || `alt-${Date.now()}`,
        timestamp: alert.source?.publishedAt || evt.timestamp || new Date().toISOString(),
        relativeTime: 'Just now',
        category: 'official_bulletin',
        scope: 'india',
        title: alert.title || 'Official Hazard Bulletin Updated',
        description: alert.headline || alert.description || 'Emergency bulletin updated by central monitoring authority.',
        severity: alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'moderate',
        sourceAgency: alert.source?.agency || 'India Meteorological Department (IMD)',
        locationTag: `${alert.location?.district || alert.location?.city || 'Regional'}, ${alert.location?.state || 'India'}`,
        coordinates: alert.location?.coordinates,
        metricsBadge: alert.metrics?.intensity || 'Priority Bulletin',
        isVerified: true,
        actionUrl: `/alerts?alertId=${alert.id}`,
      };

      this.prependActivity(newActivity);
    });
  }

  private prependActivity(item: ActivityFeedItem): void {
    // Avoid duplicates by ID or title+timestamp
    const exists = this.activities.some((a) => a.id === item.id || (a.title === item.title && a.timestamp === item.timestamp));
    if (exists) return;

    this.activities = [item, ...this.activities].slice(0, 100);
    this.saveToCache();
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    const list = [...this.activities];
    this.subscribers.forEach((cb) => {
      try {
        cb(list);
      } catch (err) {
        console.error('[ActivityService] Subscriber notify error:', err);
      }
    });
  }

  /**
   * Fetch current activity stream from backend API with fallback to cache/demo
   */
  public async getActivities(limit: number = 50, forceFresh: boolean = false): Promise<ActivityFeedItem[]> {
    if (this.isInitialized && !forceFresh && this.activities.length > 0) {
      return this.activities.slice(0, limit);
    }

    try {
      const res = await ApiClient.get<any>('/v1/activity', { limit }, { skipCache: forceFresh, timeoutMs: 5000 });

      let items: ActivityFeedItem[] = [];
      if (res && Array.isArray(res.activities)) {
        items = res.activities.map((item: any) => this.normalizeItem(item));
      } else if (Array.isArray(res)) {
        items = res.map((item: any) => this.normalizeItem(item));
      }

      if (items.length > 0) {
        this.activities = items;
        this.saveToCache();
        this.isInitialized = true;
        this.notifySubscribers();
        return this.activities.slice(0, limit);
      }
    } catch (err) {
      console.warn('[ActivityService] Failed to load fresh activities from API, using cached/demo data:', err);
    }

    if (this.activities.length === 0) {
      this.activities = DEMO_ACTIVITIES;
      this.saveToCache();
    }

    this.isInitialized = true;
    return this.activities.slice(0, limit);
  }

  private normalizeItem(raw: any): ActivityFeedItem {
    return {
      id: raw.id || `act-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: raw.timestamp || new Date().toISOString(),
      relativeTime: raw.relativeTime || 'Recently',
      category: (raw.category as ActivityCategory) || 'official_bulletin',
      scope: raw.scope || 'india',
      title: raw.title || 'Emergency Activity Event',
      description: raw.description || '',
      severity: raw.severity || 'moderate',
      sourceAgency: raw.sourceAgency || 'National Disaster Cell',
      locationTag: raw.locationTag || 'India',
      coordinates: Array.isArray(raw.coordinates) ? raw.coordinates : undefined,
      metricsBadge: raw.metricsBadge || undefined,
      isVerified: raw.isVerified ?? true,
      actionUrl: raw.actionUrl || undefined,
    };
  }

  /**
   * Subscribe to real-time activity stream updates
   */
  public subscribe(callback: (activities: ActivityFeedItem[]) => void): () => void {
    this.subscribers.add(callback);
    if (this.activities.length > 0) {
      callback(this.activities);
    } else {
      this.getActivities().then(callback);
    }
    return () => {
      this.subscribers.delete(callback);
    };
  }
}

export const ActivityService = new ActivityServiceSingleton();
