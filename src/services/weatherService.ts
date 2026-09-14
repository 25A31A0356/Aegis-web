import { DEMO_CITY_WEATHER, DEMO_HOURLY_FORECAST, DEMO_DAILY_FORECAST, DEMO_MULTI_HAZARD_RISK } from '../data/demoWeather';
import { WeatherTelemetry, HourlyForecastItem, DailyForecastItem, MultiHazardRiskEntry } from '../types/weather';

export class WeatherService {
  public static getWeatherForCity(cityKey: string): WeatherTelemetry {
    const key = cityKey.toLowerCase();
    if (DEMO_CITY_WEATHER[key]) {
      return DEMO_CITY_WEATHER[key];
    }
    // Fallback to Hyderabad
    return DEMO_CITY_WEATHER['hyderabad'];
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
