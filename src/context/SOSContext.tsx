import React, { createContext, useContext, useState, useEffect } from 'react';
import { SOSService } from '../services/sosService';
import { RoutingService, SimulatedRoute } from '../services/routingService';
import { SOSBeacon, SOSTriageStatus } from '../types/sos';

interface SOSContextType {
  beacons: SOSBeacon[];
  selectedBeacon: SOSBeacon | null;
  activeRoute: SimulatedRoute | null;
  isRouteSimulating: boolean;
  setSelectedBeacon: (beacon: SOSBeacon | null) => void;
  updateBeaconTriage: (id: string, newStatus: SOSTriageStatus, notes?: string) => void;
  triggerEmergencyRouteSimulation: (beacon: SOSBeacon) => void;
  clearActiveRoute: () => void;
  createNewSOSBeacon: (data: Partial<SOSBeacon>) => SOSBeacon;
}

const SOSContext = createContext<SOSContextType | undefined>(undefined);

export const SOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [beacons, setBeacons] = useState<SOSBeacon[]>(SOSService.getBeacons());
  const [selectedBeacon, setSelectedBeacon] = useState<SOSBeacon | null>(null);
  const [activeRoute, setActiveRoute] = useState<SimulatedRoute | null>(null);
  const [isRouteSimulating, setIsRouteSimulating] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = SOSService.subscribe((updatedList) => {
      setBeacons(updatedList);
      if (selectedBeacon) {
        const fresh = updatedList.find((b) => b.id === selectedBeacon.id);
        if (fresh) setSelectedBeacon(fresh);
      }
    });
    return () => unsubscribe();
  }, [selectedBeacon]);

  const updateBeaconTriage = (id: string, newStatus: SOSTriageStatus, notes?: string) => {
    const updated = SOSService.updateTriageStatus(id, newStatus, 'Operator #419 (AEGIS Web Desk)', notes);
    if (updated && selectedBeacon?.id === id) {
      setSelectedBeacon(updated);
    }
  };

  const triggerEmergencyRouteSimulation = (beacon: SOSBeacon) => {
    setSelectedBeacon(beacon);
    setIsRouteSimulating(true);

    // Staging depot coordinates (offset slightly for realistic response routing)
    const stagingCoords: [number, number] = [
      beacon.coordinates[0] + 0.015,
      beacon.coordinates[1] - 0.018,
    ];

    const route = RoutingService.calculateEmergencyRoute(
      stagingCoords,
      beacon.coordinates,
      beacon.assignedUnit?.unitName || 'Nearest NDRF/SDRF Staging Base',
      beacon.anonymousAlias
    );

    setActiveRoute(route);
  };

  const clearActiveRoute = () => {
    setActiveRoute(null);
    setIsRouteSimulating(false);
  };

  const createNewSOSBeacon = (data: Partial<SOSBeacon>) => {
    const newBeacon = SOSService.createDemoBeacon(data);
    setSelectedBeacon(newBeacon);
    return newBeacon;
  };

  return (
    <SOSContext.Provider
      value={{
        beacons,
        selectedBeacon,
        activeRoute,
        isRouteSimulating,
        setSelectedBeacon,
        updateBeaconTriage,
        triggerEmergencyRouteSimulation,
        clearActiveRoute,
        createNewSOSBeacon,
      }}
    >
      {children}
    </SOSContext.Provider>
  );
};

export const useSOS = () => {
  const context = useContext(SOSContext);
  if (!context) {
    throw new Error('useSOS must be used within an SOSProvider');
  }
  return context;
};
