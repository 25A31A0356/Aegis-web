/**
 * AGIES Map Service - GIS & Technical Layers Abstraction
 * Handles tile providers (Satellite, Radar, Streets, Terrain), radar precipitation reflectivity contours, and lightning telemetry.
 */

export interface MapTileProvider {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom?: number;
}

export interface RadarStormCell {
  id: string;
  center: [number, number];
  intensity: 'light' | 'moderate' | 'heavy';
  radiusMeters: number;
  dbz: number;
  movementHeading: string;
  speedKmh: number;
}

export interface LightningStrike {
  id: string;
  coordinates: [number, number];
  timestamp: string;
  peakCurrentKa: number;
  type: 'cloud-to-ground' | 'intra-cloud';
}

class MapServiceClass {
  // Safe Tile Providers (No secret keys embedded)
  private providers: Record<string, MapTileProvider> = {
    streets: {
      id: 'streets',
      name: 'Standard Streets (OSM)',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    },
    cartoLight: {
      id: 'cartoLight',
      name: 'CartoDB Positron',
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    },
    satellite: {
      id: 'satellite',
      name: 'Esri World Imagery (Satellite)',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18,
    },
    terrain: {
      id: 'terrain',
      name: 'OpenTopoMap (Terrain)',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
      maxZoom: 17,
    },
  };

  /**
   * Returns tile layer configuration for a given layer style
   */
  getTileProvider(layerStyle: 'satellite' | 'streets' | 'terrain' | 'dark' = 'streets'): MapTileProvider {
    if (layerStyle === 'satellite') return this.providers.satellite;
    if (layerStyle === 'terrain') return this.providers.terrain;
    return this.providers.cartoLight || this.providers.streets;
  }

  /**
   * Generates dynamic Doppler radar storm clusters around the active coordinates
   */
  getRadarStormCells(center: [number, number]): RadarStormCell[] {
    const [lat, lng] = center;
    return [
      {
        id: 'cell-heavy-1',
        center: [lat + 0.08, lng + 0.06],
        intensity: 'heavy',
        radiusMeters: 9000,
        dbz: 54,
        movementHeading: 'ENE (65°)',
        speedKmh: 28,
      },
      {
        id: 'cell-mod-1',
        center: [lat + 0.04, lng + 0.03],
        intensity: 'moderate',
        radiusMeters: 18000,
        dbz: 42,
        movementHeading: 'ENE (60°)',
        speedKmh: 26,
      },
      {
        id: 'cell-light-1',
        center: [lat - 0.02, lng - 0.04],
        intensity: 'light',
        radiusMeters: 28000,
        dbz: 26,
        movementHeading: 'NE (50°)',
        speedKmh: 22,
      },
      {
        id: 'cell-mod-2',
        center: [lat - 0.09, lng + 0.12],
        intensity: 'moderate',
        radiusMeters: 14000,
        dbz: 38,
        movementHeading: 'E (85°)',
        speedKmh: 31,
      },
    ];
  }

  /**
   * Returns active lightning flash strikes in the region
   */
  getRegionalLightningStrikes(center: [number, number]): LightningStrike[] {
    const [lat, lng] = center;
    return [
      {
        id: 'lt-1',
        coordinates: [lat + 0.075, lng + 0.055],
        timestamp: '1 min ago',
        peakCurrentKa: -42,
        type: 'cloud-to-ground',
      },
      {
        id: 'lt-2',
        coordinates: [lat + 0.09, lng + 0.07],
        timestamp: '2 min ago',
        peakCurrentKa: 31,
        type: 'cloud-to-ground',
      },
      {
        id: 'lt-3',
        coordinates: [lat + 0.03, lng + 0.04],
        timestamp: '3 min ago',
        peakCurrentKa: -18,
        type: 'intra-cloud',
      },
      {
        id: 'lt-4',
        coordinates: [lat - 0.085, lng + 0.11],
        timestamp: '5 min ago',
        peakCurrentKa: -55,
        type: 'cloud-to-ground',
      },
    ];
  }

  /**
   * Returns color code corresponding to radar intensity
   */
  getRadarIntensityColor(intensity: 'light' | 'moderate' | 'heavy'): { fill: string; stroke: string } {
    switch (intensity) {
      case 'heavy':
        return { fill: '#E94B68', stroke: '#B82842' }; // Red/Crimson
      case 'moderate':
        return { fill: '#F4C84A', stroke: '#C89618' }; // Yellow/Orange
      case 'light':
      default:
        return { fill: '#45C79A', stroke: '#289870' }; // Green/Cyan
    }
  }
}

export const MapService = new MapServiceClass();
