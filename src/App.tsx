import React, { useState, useEffect } from 'react';
import { LocationProvider } from './context/LocationContext';
import { NotificationProvider } from './context/NotificationContext';
import { SOSProvider } from './context/SOSContext';
import { ProfileProvider } from './context/ProfileContext';
import { Header } from './components/layout/Header';
import { LiveHazardTicker } from './components/layout/LiveHazardTicker';
import { Footer } from './components/layout/Footer';
import { SearchModal } from './components/layout/SearchModal';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { DashboardPage } from './pages/DashboardPage';
import { LiveMapPage } from './pages/LiveMapPage';
import { ForecastsPage } from './pages/ForecastsPage';
import { HazardsPage } from './pages/HazardsPage';
import { SOSPage } from './pages/SOSPage';
import { ActivityPage } from './pages/ActivityPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [selectedHazardId, setSelectedHazardId] = useState<string | null>(null);
  const [selectedSOSId, setSelectedSOSId] = useState<string | null>(null);
  const [initialHazardCategory, setInitialHazardCategory] = useState<string | undefined>(undefined);

  // Keyboard shortcut for Search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectHazardFromTickerOrSearch = (hazardId: string) => {
    setSelectedHazardId(hazardId);
    setActiveTab('hazards');
  };

  const handleSelectSOSFromSearch = (sosId: string) => {
    setSelectedSOSId(sosId);
    setActiveTab('sos');
  };

  const handleFilterHazardsCategory = (category: string) => {
    setInitialHazardCategory(category);
    setActiveTab('hazards');
  };

  return (
    <LocationProvider>
      <NotificationProvider>
        <SOSProvider>
          <ProfileProvider>
            <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-sky-200 selection:text-sky-900 antialiased font-sans">
            {/* Live Hazard Ticker Banner */}
            <LiveHazardTicker onSelectHazard={handleSelectHazardFromTickerOrSearch} />

            {/* Top Navigation Header */}
            <Header
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenProfile={() => setIsProfileOpen(true)}
              onSelectHazard={handleSelectHazardFromTickerOrSearch}
            />

            {/* Main Content View Switcher */}
            <main className="flex-1">
              {activeTab === 'dashboard' && (
                <DashboardPage
                  onNavigate={setActiveTab}
                  onSelectHazardById={handleSelectHazardFromTickerOrSearch}
                  onFilterHazardsCategory={handleFilterHazardsCategory}
                />
              )}

              {activeTab === 'live-map' && (
                <LiveMapPage
                  onNavigate={setActiveTab}
                  onSelectHazardById={handleSelectHazardFromTickerOrSearch}
                />
              )}

              {activeTab === 'forecasts' && <ForecastsPage />}

              {activeTab === 'hazards' && (
                <HazardsPage
                  onNavigate={setActiveTab}
                  preSelectedHazardId={selectedHazardId}
                  initialCategory={initialHazardCategory}
                />
              )}

              {activeTab === 'sos' && (
                <SOSPage preSelectedSOSId={selectedSOSId} />
              )}

              {activeTab === 'activity' && (
                <ActivityPage
                  onNavigate={setActiveTab}
                  onSelectHazardById={handleSelectHazardFromTickerOrSearch}
                />
              )}
            </main>

            {/* Bottom Footer & Helplines */}
            <Footer />

            {/* Global Search Modal (Ctrl+K) */}
            <SearchModal
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              onNavigate={setActiveTab}
              onSelectHazard={handleSelectHazardFromTickerOrSearch}
              onSelectSOS={handleSelectSOSFromSearch}
            />

            {/* Notification Drawer */}
            <NotificationDrawer
              onNavigate={setActiveTab}
              onSelectHazard={handleSelectHazardFromTickerOrSearch}
            />

            {/* User Account & Safety Profile Modal */}
            <UserProfileModal
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
            />
          </div>
        </ProfileProvider>
      </SOSProvider>
    </NotificationProvider>
  </LocationProvider>
  );
};
