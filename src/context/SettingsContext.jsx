import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { systemSettingsApi } from '../api/systemSettingsApi';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    platformName: 'Sweet Delights Bakery',
    supportEmail: 'orders@sweetdelightsbakery.co.ke',
    supportPhone: '+254 700 123 456',
    storeAddress: '1st Avenue, Parklands / Westlands, Nairobi, Kenya',
    currency: 'KES',
    defaultDeliveryFee: 350,
    freeDeliveryThreshold: 6000,
    minimumLeadTimeHours: 24,
    openingTime: '08:00 AM',
    closingTime: '07:00 PM',
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);
  const [maintenanceTriggered, setMaintenanceTriggered] = useState(false);

  const refreshSettings = useCallback(async () => {
    try {
      const response = await systemSettingsApi.getPublicSettings();
      if (response && response.success && response.data) {
        setSettings(response.data);
        if (response.data.maintenanceMode) {
          setMaintenanceTriggered(true);
        } else {
          setMaintenanceTriggered(false);
        }
      }
    } catch (error) {
      console.warn('Could not load public platform settings, using defaults');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();

    const handleMaintenanceEvent = () => {
      setMaintenanceTriggered(true);
    };

    window.addEventListener('platform:maintenance', handleMaintenanceEvent);
    return () => {
      window.removeEventListener('platform:maintenance', handleMaintenanceEvent);
    };
  }, [refreshSettings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        maintenanceTriggered,
        setMaintenanceTriggered,
        refreshSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
