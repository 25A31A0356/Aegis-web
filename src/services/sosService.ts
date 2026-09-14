import { DEMO_SOS_BEACONS } from '../data/demoSOS';
import { SOSBeacon, SOSTriageStatus } from '../types/sos';

export class SOSService {
  private static beacons: SOSBeacon[] = [...DEMO_SOS_BEACONS];
  private static listeners: Array<(beacons: SOSBeacon[]) => void> = [];

  public static getBeacons(): SOSBeacon[] {
    return [...this.beacons];
  }

  public static getBeaconById(id: string): SOSBeacon | undefined {
    return this.beacons.find((b) => b.id === id);
  }

  public static updateTriageStatus(
    id: string,
    newStatus: SOSTriageStatus,
    actorName: string = 'Command Center Operator',
    notes?: string
  ): SOSBeacon | undefined {
    const beacon = this.beacons.find((b) => b.id === id);
    if (!beacon) return undefined;

    beacon.triageStatus = newStatus;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const actionText =
      newStatus === 'acknowledged'
        ? 'Distress Beacon Acknowledged by Dispatcher'
        : newStatus === 'dispatching'
        ? 'Emergency Response Unit Dispatched En Route'
        : newStatus === 'on_scene'
        ? 'Rescue Unit Arrived On Scene'
        : newStatus === 'resolved'
        ? 'Incident Resolved & Extracted to Safety'
        : newStatus === 'cancelled'
        ? 'Distress Beacon Cancelled / False Alarm'
        : 'Status Updated';

    beacon.timeline.unshift({
      timestamp: timeStr,
      actor: actorName,
      action: actionText,
      notes: notes || `Triage transitioned to ${newStatus.toUpperCase()}`,
    });

    this.notifyListeners();
    return { ...beacon };
  }

  public static createDemoBeacon(beaconData: Partial<SOSBeacon>): SOSBeacon {
    const id = `SOS-APP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBeacon: SOSBeacon = {
      id,
      anonymousAlias: `Beacon #${id.replace('SOS-', '')} (App User)`,
      phoneMasked: '+91 98**** 1122',
      timestamp: new Date().toISOString(),
      emergencyType: beaconData.emergencyType || 'flash_flood_stranding',
      emergencyTitle: beaconData.emergencyTitle || 'Emergency Distress Beacon Received',
      locationName: beaconData.locationName || 'Near Current GPS Fix',
      district: beaconData.district || 'Hyderabad',
      state: beaconData.state || 'Telangana',
      coordinates: beaconData.coordinates || [17.3850, 78.4867],
      gpsAccuracyMeters: 5.0,
      batteryPercent: 78,
      personsCount: beaconData.personsCount || 2,
      triageStatus: 'incoming',
      severity: 'critical',
      timeline: [
        {
          timestamp: new Date().toLocaleTimeString(),
          actor: 'AEGIS Mobile App',
          action: 'Distress Beacon Initialized by Citizen',
          notes: 'High priority push received via secure emergency protocol.',
        },
      ],
      ...beaconData,
    };

    this.beacons.unshift(newBeacon);
    this.notifyListeners();
    return newBeacon;
  }

  public static subscribe(listener: (beacons: SOSBeacon[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notifyListeners() {
    const clone = [...this.beacons];
    this.listeners.forEach((l) => l(clone));
  }
}
