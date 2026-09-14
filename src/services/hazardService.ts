import { DEMO_HAZARDS } from '../data/demoHazards';
import { DEMO_STATES } from '../data/demoStates';
import { HazardItem, HazardCategory, HazardSeverity, HazardNature, HazardStatus } from '../types/hazard';

export interface HazardFilterOptions {
  searchQuery?: string;
  category?: HazardCategory | 'all';
  severity?: HazardSeverity | 'all';
  nature?: HazardNature | 'all';
  status?: HazardStatus | 'all';
  stateId?: string | 'all';
  isHumanMade?: boolean | 'all';
}

export class HazardService {
  private static hazards: HazardItem[] = [...DEMO_HAZARDS];

  public static getAllHazards(): HazardItem[] {
    return [...this.hazards];
  }

  public static getHazardById(id: string): HazardItem | undefined {
    return this.hazards.find((h) => h.id === id);
  }

  public static filterHazards(options: HazardFilterOptions): HazardItem[] {
    return this.hazards.filter((item) => {
      if (options.searchQuery) {
        const q = options.searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchHeadline = item.headline.toLowerCase().includes(q);
        const matchState = item.location.state.toLowerCase().includes(q);
        const matchDistrict = item.location.district.toLowerCase().includes(q);
        const matchCategory = item.categoryName.toLowerCase().includes(q);
        const matchAgency = item.source.agency.toLowerCase().includes(q);
        if (!matchTitle && !matchHeadline && !matchState && !matchDistrict && !matchCategory && !matchAgency) {
          return false;
        }
      }

      if (options.category && options.category !== 'all' && item.category !== options.category) {
        return false;
      }

      if (options.severity && options.severity !== 'all' && item.severity !== options.severity) {
        return false;
      }

      if (options.nature && options.nature !== 'all' && item.nature !== options.nature) {
        return false;
      }

      if (options.status && options.status !== 'all' && item.status !== options.status) {
        return false;
      }

      if (options.isHumanMade !== undefined && options.isHumanMade !== 'all') {
        if (Boolean(item.isHumanMade) !== options.isHumanMade) {
          return false;
        }
      }

      if (options.stateId && options.stateId !== 'all') {
        const stateObj = DEMO_STATES.find((s) => s.id === options.stateId || s.name.toLowerCase() === options.stateId?.toLowerCase());
        if (stateObj && !item.location.state.toLowerCase().includes(stateObj.name.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }

  public static getMetricsSummary() {
    const totalHazards = this.hazards.length;
    const criticalHazards = this.hazards.filter((h) => h.severity === 'critical').length;
    const warningHazards = this.hazards.filter((h) => h.severity === 'warning').length;
    const activeIncidents = this.hazards.filter((h) => h.nature === 'incident' && h.status === 'active').length;
    const activeWarnings = this.hazards.filter((h) => h.nature === 'warning' && h.status === 'active').length;
    const activeForecasts = this.hazards.filter((h) => h.nature === 'forecast').length;

    return {
      totalHazards,
      criticalHazards,
      warningHazards,
      activeIncidents,
      activeWarnings,
      activeForecasts,
    };
  }
}
