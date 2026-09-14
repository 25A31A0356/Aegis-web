import React, { useState } from 'react';
import { TimelineSlider, TIMELINE_STEPS } from '../components/forecast/TimelineSlider';
import { WeatherForecastChart } from '../components/forecast/WeatherForecastChart';
import { MultiHazardRiskTable } from '../components/forecast/MultiHazardRiskTable';
import { AtmosphericMatrix } from '../components/forecast/AtmosphericMatrix';
import { WeatherService } from '../services/weatherService';
import { useLocation } from '../context/LocationContext';
import { CloudRain, Compass, AlertCircle, Info, Sparkles } from 'lucide-react';

export const ForecastsPage: React.FC = () => {
  const { weather, selectedCityKey, setSelectedCity } = useLocation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const availableCities = WeatherService.getAvailableCities();
  const hourlyData = WeatherService.getHourlyForecast();
  const multiHazardRisks = WeatherService.getMultiHazardRiskIndex();

  const currentStep = TIMELINE_STEPS[currentStepIndex];

  // Adjust telemetry dynamically based on timeline step
  const dynamicWeather = {
    ...weather,
    temp: Number((weather.temp + currentStep.tempOffset).toFixed(1)),
    rainProbability: Math.min(100, Math.max(0, weather.rainProbability + currentStep.rainProbOffset)),
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      {/* Top Location & Forecast Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
            <h1 className="font-extrabold text-base text-slate-900 font-mono uppercase tracking-wider">
              Predictive Meteorology & Multi-Hazard Modeling
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Atmospheric Simulation Engine • Location: <strong className="text-slate-900">{weather.cityName}, {weather.stateName}</strong>
          </p>
        </div>

        {/* Quick City Selector Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-mono text-slate-400 font-bold uppercase mr-1">
            Station:
          </span>
          {availableCities.slice(0, 6).map((city) => (
            <button
              key={city.key}
              onClick={() => setSelectedCity(city.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCityKey === city.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Multi-Step Predictive Timeline Slider */}
      <TimelineSlider
        currentStepIndex={currentStepIndex}
        onSelectStepIndex={setCurrentStepIndex}
      />

      {/* 2. 24-Hour Convective Curve */}
      <WeatherForecastChart hourlyData={hourlyData} />

      {/* 3. Multi-Hazard Predictive Confidence Matrix Table */}
      <MultiHazardRiskTable risks={multiHazardRisks} />

      {/* 4. Atmospheric & Solar Sensor Grid */}
      <AtmosphericMatrix weather={dynamicWeather} />

      {/* Scientific Disclaimer Note */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 leading-relaxed font-mono flex items-start gap-2.5">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <strong>Forecast Modeling Notice:</strong> Numerical weather predictions are computed via IMD GFS-0.25° ensembles and Doppler radar extrapolation algorithms. Observational geological incidents (such as landslides and earthquakes) are subject to seismic sensor triggers and GSI field verification.
        </div>
      </div>
    </div>
  );
};
