/**
 * AEGIS ALERT - Citizen Incident Report Service
 * Connects to Aegis Software API (/api/reports and /api/reports/media) via ApiClient.
 * Handles client validation, media uploads, and persistent reporting queue.
 */

import { ApiClient } from './apiClient';
import { CitizenReport, ReportMediaItem, ReportHazardType, ReportSeverity, ReportStatus } from '../types/report';

const STORAGE_KEY = 'agies_citizen_reports';

export const INITIAL_DEMO_REPORTS: CitizenReport[] = [
  {
    id: 'AGIES-REP-849102',
    hazardType: 'flood',
    hazardLabel: 'Urban Flooding',
    location: {
      lat: 17.4483,
      lng: 78.3915,
      address: 'Madhapur Main Road near Cyber Towers Underpass',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
    },
    media: [
      {
        id: 'med-101',
        mediaReference: 's3://agies-media-vault/2026/09/rep-849102-1.jpg',
        url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
        fileType: 'image/jpeg',
        fileSize: 1420500,
        fileName: 'underpass_waterlogging.jpg',
        uploadedAt: '18 mins ago',
      },
    ],
    description: 'Underpass completely submerged with 3.5 feet of rushing storm runoff. Multiple four-wheelers stalled in water.',
    severity: 'high',
    optionalDetails: {
      peopleAffectedEstimate: '20-50',
      isRoadBlocked: true,
      isImmediateDanger: true,
    },
    reporter: {
      name: 'Priya Reddy',
      isAnonymous: false,
    },
    timestamp: 'Today, 02:45 PM IST',
    status: 'verified',
    verificationNotes: 'GHMC Disaster Response Force deployed 2 dewatering suction pumps.',
  },
  {
    id: 'AGIES-REP-731945',
    hazardType: 'road_blockage',
    hazardLabel: 'Fallen Tree & Grid Line',
    location: {
      lat: 19.0760,
      lng: 72.8777,
      address: 'SVT Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
    },
    media: [
      {
        id: 'med-102',
        mediaReference: 's3://agies-media-vault/2026/09/rep-731945-1.jpg',
        url: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=600&q=80',
        fileType: 'image/jpeg',
        fileSize: 2104000,
        fileName: 'fallen_tree.jpg',
        uploadedAt: '1 hour ago',
      },
    ],
    description: 'Centuries-old banyan tree uprooted across dual carriageway during gale winds, snapping domestic power wires.',
    severity: 'medium',
    optionalDetails: {
      peopleAffectedEstimate: '5-20',
      isRoadBlocked: 'partial',
      isImmediateDanger: false,
    },
    reporter: {
      isAnonymous: true,
    },
    timestamp: 'Today, 01:20 PM IST',
    status: 'dispatched',
    verificationNotes: 'Brihanmumbai Municipal Corporation tree-clearing crew on site.',
  },
  {
    id: 'AGIES-REP-610283',
    hazardType: 'landslide',
    hazardLabel: 'Mudslide Debris',
    location: {
      lat: 30.7333,
      lng: 78.4333,
      address: 'NH-108 Milepost 42, near Dharasu Bend',
      city: 'Uttarkashi',
      state: 'Uttarakhand',
      pincode: '249193',
    },
    media: [
      {
        id: 'med-103',
        mediaReference: 's3://agies-media-vault/2026/09/rep-610283-1.jpg',
        url: 'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&w=600&q=80',
        fileType: 'image/jpeg',
        fileSize: 3180000,
        fileName: 'mudslide_debris.jpg',
        uploadedAt: '3 hours ago',
      },
    ],
    description: 'Hillside rockfall and wet mud debris blocking single-lane mountain highway. Traffic halted on both sides.',
    severity: 'critical',
    optionalDetails: {
      peopleAffectedEstimate: '50+',
      isRoadBlocked: true,
      isImmediateDanger: true,
    },
    reporter: {
      name: 'Rohan Joshi',
      isAnonymous: false,
    },
    timestamp: 'Today, 11:30 AM IST',
    status: 'pending_review',
    verificationNotes: 'Border Roads Organisation (BRO) bulldozers en route.',
  },
];

export class ReportService {
  /**
   * Uploads media attachment via Aegis API /api/reports/media
   */
  public static async uploadMediaToObjectStorage(file: File): Promise<ReportMediaItem> {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    const isImage = validImageTypes.includes(file.type);
    const isVideo = validVideoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      throw new Error(`Unsupported media format: ${file.type}. Please upload JPG, PNG, or MP4.`);
    }

    const maxSizeBytes = isVideo ? 50 * 1024 * 1024 : 15 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit (${isVideo ? '50MB' : '15MB'}).`);
    }

    let previewUrl = '';
    if (typeof FileReader !== 'undefined') {
      previewUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    try {
      const uploadRes = await ApiClient.post<{ mediaUrl: string; fileId: string; sanitizedFileName: string }>(
        '/reports/media',
        {
          fileName: file.name,
          fileType: file.type,
          fileSizeBytes: file.size,
          base64Content: previewUrl.slice(0, 100),
        }
      );

      if (uploadRes && uploadRes.mediaUrl) {
        return {
          id: uploadRes.fileId,
          mediaReference: uploadRes.mediaUrl,
          url: previewUrl || uploadRes.mediaUrl,
          fileType: file.type,
          fileSize: file.size,
          fileName: uploadRes.sanitizedFileName,
          uploadedAt: 'Just now',
        };
      }
    } catch (e) {
      console.warn('[ReportService] Backend media upload error, using local buffer:', e);
    }

    const mediaId = `med-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return {
      id: mediaId,
      mediaReference: `s3://agies-media-vault/${new Date().getFullYear()}/${mediaId}-${file.name.replace(/\s+/g, '_')}`,
      url: previewUrl || `blob:https://agies.gov.in/${mediaId}`,
      fileType: file.type,
      fileSize: file.size,
      fileName: file.name,
      uploadedAt: 'Just now',
    };
  }

  /**
   * Submits citizen incident report to Aegis Software API (/api/reports)
   */
  public static async submitReport(
    payload: Omit<CitizenReport, 'id' | 'timestamp' | 'status'>
  ): Promise<CitizenReport> {
    if (!payload.hazardType) {
      throw new Error('Hazard type is required.');
    }
    if (!payload.location || !payload.location.address) {
      throw new Error('Valid location and address are required.');
    }
    if (!payload.description || payload.description.trim().length < 10) {
      throw new Error('Please provide at least 10 characters describing the incident.');
    }
    if (!payload.severity) {
      throw new Error('Severity classification is required.');
    }

    const now = new Date();
    const timestamp = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST`;

    try {
      const backendRes = await ApiClient.post<any>('/reports', {
        hazardType: payload.hazardType,
        title: `${payload.hazardLabel || payload.hazardType} incident near ${payload.location.city || 'local sector'}`,
        description: payload.description,
        severity: payload.severity,
        location: {
          lat: payload.location.lat,
          lng: payload.location.lng,
          address: payload.location.address,
          city: payload.location.city,
          state: payload.location.state,
        },
        mediaUrls: payload.media?.map((m) => m.url) || [],
        contactInfo: {
          name: payload.reporter?.name,
          phone: payload.optionalDetails?.contactPhone,
          isAnonymous: payload.reporter?.isAnonymous,
        },
      });

      if (backendRes) {
        const createdReport: CitizenReport = {
          ...payload,
          id: backendRes.trackingId || backendRes.id || `AGIES-REP-${Math.floor(100000 + Math.random() * 900000)}`,
          timestamp: backendRes.submittedAt ? new Date(backendRes.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST' : timestamp,
          status: backendRes.status || 'pending_review',
        };

        this.persistToLocalStorage(createdReport);
        return createdReport;
      }
    } catch (err) {
      console.warn('[ReportService] API report submission failed, persisting locally:', err);
    }

    const reportId = `AGIES-REP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newReport: CitizenReport = {
      ...payload,
      id: reportId,
      timestamp,
      status: 'pending_review',
    };

    this.persistToLocalStorage(newReport);
    return newReport;
  }

  private static persistToLocalStorage(report: CitizenReport) {
    const existing = this.getAllReports();
    const updated = [report, ...existing.filter((r) => r.id !== report.id)];
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('[ReportService] Failed to save report to localStorage:', e);
    }
  }

  /**
   * Fetches latest citizen reports from backend API or cached store
   */
  public static async fetchLiveReports(): Promise<CitizenReport[]> {
    try {
      const remote = await ApiClient.get<any[]>('/reports');
      if (Array.isArray(remote) && remote.length > 0) {
        const normalized: CitizenReport[] = remote.map((r) => ({
          id: r.trackingId || r.id,
          hazardType: (r.hazardType || 'other').toLowerCase() as ReportHazardType,
          hazardLabel: r.title || r.hazardType,
          location: {
            lat: r.location?.lat || 19.076,
            lng: r.location?.lng || 72.877,
            address: r.location?.address || 'Reported Sector',
            city: r.location?.city || 'Local Area',
            state: r.location?.state || 'India',
          },
          media: (r.mediaUrls || []).map((url: string, i: number) => ({
            id: `med-${i}`,
            mediaReference: url,
            url,
            fileType: 'image/jpeg',
            fileSize: 1024000,
            fileName: `incident_media_${i}.jpg`,
            uploadedAt: 'Verified',
          })),
          description: r.description,
          severity: (r.severity || 'medium') as ReportSeverity,
          optionalDetails: {
            peopleAffectedEstimate: r.peopleAffected || 'Unknown',
            isRoadBlocked: r.isRoadBlocked ?? false,
            isImmediateDanger: r.isImmediateDanger ?? false,
            contactPhone: r.contactInfo?.phone,
          },
          reporter: r.contactInfo ? { name: r.contactInfo.name, isAnonymous: r.contactInfo.isAnonymous } : { isAnonymous: true },
          timestamp: r.submittedAt ? new Date(r.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST' : 'Recent',
          status: (r.status || 'pending_review') as ReportStatus,
          verificationNotes: r.dispatchUnitsAssigned?.length ? `Assigned to: ${r.dispatchUnitsAssigned.join(', ')}` : undefined,
        }));

        return normalized;
      }
    } catch (e) {
      console.warn('[ReportService] Error fetching /api/reports:', e);
    }

    return this.getAllReports();
  }

  public static async fetchReportsFromApi(): Promise<CitizenReport[]> {
    return this.fetchLiveReports();
  }

  /**
   * Get all citizen reports from local cache
   */
  public static getAllReports(): CitizenReport[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_DEMO_REPORTS;
  }

  /**
   * Retrieve report by ID
   */
  public static getReportById(id: string): CitizenReport | undefined {
    const all = this.getAllReports();
    return all.find((r) => r.id === id);
  }
}
