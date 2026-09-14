import { DEMO_CITY_WEATHER, DEMO_HOURLY_FORECAST, DEMO_DAILY_FORECAST, DEMO_MULTI_HAZARD_RISK } from '../data/demoWeather';
import { WeatherTelemetry, HourlyForecastItem, DailyForecastItem, MultiHazardRiskEntry } from '../types/weather';

export const CITY_COORDINATES: Record<string, { lat: number; lng: number; stateName: string; cityName: string }> = {
  hyderabad: { lat: 17.3850, lng: 78.4867, cityName: 'Hyderabad', stateName: 'Telangana' },
  delhi: { lat: 28.6139, lng: 77.2090, cityName: 'New Delhi', stateName: 'Delhi NCR' },
  mumbai: { lat: 19.0760, lng: 72.8777, cityName: 'Mumbai', stateName: 'Maharashtra' },
  bhubaneswar: { lat: 20.2961, lng: 85.8245, cityName: 'Bhubaneswar', stateName: 'Odisha' },
  guwahati: { lat: 26.1445, lng: 91.7362, cityName: 'Guwahati', stateName: 'Assam' },
  kochi: { lat: 9.9312, lng: 76.2673, cityName: 'Kochi', stateName: 'Kerala' },
  kolkata: { lat: 22.5726, lng: 88.3639, cityName: 'Kolkata', stateName: 'West Bengal' },
  chennai: { lat: 13.0827, lng: 80.2707, cityName: 'Chennai', stateName: 'Tamil Nadu' },
  bengaluru: { lat: 12.9716, lng: 77.5946, cityName: 'Bengaluru', stateName: 'Karnataka' },
  jaipur: { lat: 26.9124, lng: 75.7873, cityName: 'Jaipur', stateName: 'Rajasthan' },
};

// In-memory cache for live weather (5 min TTL)
const liveWeatherCache: Record<string, { data: WeatherTelemetry; timestamp: number }> = {};
const CACHE_TTL_MS = 5 * 60 * 1000;

export class WeatherService {
  /**
   * Fetches real-time live meteorological telemetry from Open-Meteo Free API
   * with automatic fallback to high-fidelity seed data if offline or timeout.
   */
  public static async fetchLiveCityWeather(cityKey: string): Promise<WeatherTelemetry> {
    const key = cityKey.toLowerCase();
    const cityConfig = CITY_COORDINATES[key];
    const fallback = DEMO_CITY_WEATHER[key] || DEMO_CITY_WEATHER['hyderabad'];

    if (!cityConfig) return fallback;

    // Check cache
    const cached = liveWeatherCache[key];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${cityConfig.lat}&longitude=${cityConfig.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index&timezone=Asia%2FKolkata`;
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      
      if (!response.ok) throw new Error(`Open-Meteo HTTP ${response.status}`);
      const json = await response.json();
      const current = json.current;

      if (!current) throw new Error('Invalid Open-Meteo payload');

      const temp = Math.round(current.temperature_2m);
      const windSpeed = Math.round(current.wind_speed_10m);
      const humidity = Math.round(current.relative_humidity_2m);
      const precip = Number(current.precipitation || 0);

      let condition = fallback.condition;
      if (precip > 5.0) condition = 'Heavy Rain & Flooding';
      else if (precip > 0.5) condition = 'Passing Thunderstorms';
      else if (temp >= 40) condition = 'Extreme Heatwave';
      else if (temp >= 32) condition = 'Hot & Humid';
      else if (windSpeed > 45) condition = 'Gale Winds Advisory';

      const liveTelemetry: WeatherTelemetry = {
        ...fallback,
        temp,
        feelsLike: Math.round(current.apparent_temperature || temp + 2),
        humidity,
        windSpeed,
        windDirection: current.wind_direction_10m || fallback.windDirection,
        barometricPressureHpa: Math.round(current.surface_pressure || fallback.barometricPressureHpa),
        uvIndex: Math.round(current.uv_index || fallback.uvIndex),
        rainProbability: precip > 0 ? Math.min(95, Math.max(30, Math.round(precip * 20))) : fallback.rainProbability,
        condition,
        updatedAt: 'Live Open-Meteo Telemetry',
      };

      liveWeatherCache[key] = {
        data: liveTelemetry,
        timestamp: Date.now(),
      };

      return liveTelemetry;
    } catch (err) {
      console.warn(`[WeatherService] Live fetch failed for ${cityKey}, using baseline seed:`, err);
      return fallback;
    }
  }

  public static getWeatherForCity(cityKey: string): WeatherTelemetry {
    const key = cityKey.toLowerCase();
    const cached = liveWeatherCache[key];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
    return DEMO_CITY_WEATHER[key] || DEMO_CITY_WEATHER['hyderabad'];
  }

  public static getHourlyForecast(): HourlyForecastItem[] {
    return [...DEMO_HOURLY_FORECAST];
  }

  public static getDailyForecast(): DailyForecastItem[] {
    return [...DEMO_DAILY_FORECAST];
  }

  public static getMultiHazardRiskIndex(): MultiHazardRiskEntry[] {
    return [...DEMO_MULTI_HAZARD_RISK];
  }

  public static getAvailableCities() {
    return Object.keys(DEMO_CITY_WEATHER).map((k) => ({
      key: k,
      name: DEMO_CITY_WEATHER[k].cityName,
      state: DEMO_CITY_WEATHER[k].stateName,
      temp: DEMO_CITY_WEATHER[k].temp,
      condition: DEMO_CITY_WEATHER[k].condition,
    }));
  }
}
