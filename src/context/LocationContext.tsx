import React, { createContext, useContext, useState } from 'react';
import { DEMO_STATES } from '../data/demoStates';
import { DEMO_CITY_WEATHER } from '../data/demoWeather';
import { StateRiskData } from '../types/location';
import { WeatherTelemetry } from '../types/weather';

interface LocationContextType {
  selectedCityKey: string;
  weather: WeatherTelemetry;
  selectedState: StateRiskData | undefined;
  statesList: StateRiskData[];
  setSelectedCity: (cityKey: string) => void;
  setSelectedStateById: (stateId: string) => void;
  resetToNational: () => void;
  isNationalOverview: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCityKey, setSelectedCityKey] = useState<string>('hyderabad');
  const [selectedStateId, setSelectedStateId] = useState<string | null>('TS');
  const [isNationalOverview, setIsNationalOverview] = useState<boolean>(false);

  const weather = DEMO_CITY_WEATHER[selectedCityKey] || DEMO_CITY_WEATHER['hyderabad'];
  const selectedState = DEMO_STATES.find((s) => s.id === selectedStateId);

  const setSelectedCity = (cityKey: string) => {
    setSelectedCityKey(cityKey);
    setIsNationalOverview(false);
    // Auto-map state if possible
    if (cityKey === 'hyderabad') setSelectedStateId('TS');
    else if (cityKey === 'delhi') setSelectedStateId('DL');
    else if (cityKey === 'mumbai') setSelectedStateId('MH');
    else if (cityKey === 'bhubaneswar') setSelectedStateId('OD');
    else if (cityKey === 'guwahati') setSelectedStateId('AS');
    else if (cityKey === 'kochi') setSelectedStateId('KL');
    else if (cityKey === 'kolkata') setSelectedStateId('WB');
    else if (cityKey === 'chennai') setSelectedStateId('TN');
  };

  const setSelectedStateById = (stateId: string) => {
    setSelectedStateId(stateId);
    setIsNationalOverview(false);
    const state = DEMO_STATES.find((s) => s.id === stateId);
    if (state) {
      const capitalKey = state.capital.split(' ')[0].toLowerCase();
      if (DEMO_CITY_WEATHER[capitalKey]) {
        setSelectedCityKey(capitalKey);
      }
    }
  };

  const resetToNational = () => {
    setIsNationalOverview(true);
    setSelectedStateId(null);
  };

  return (
    <LocationContext.Provider
      value={{
        selectedCityKey,
        weather,
        selectedState,
        statesList: DEMO_STATES,
        setSelectedCity,
        setSelectedStateById,
        resetToNational,
        isNationalOverview,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
