import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

import type { Station } from '../types/game';
import { getErrorMessage } from '../utils/errors';
import { distanceMeters } from '../utils/geo';

export interface GeofencingState {
  position: { latitude: number; longitude: number } | null;
  activeStation: Station | null;
  permissionDenied: boolean;
  errorMessage: string | null;
  closeActiveStation: () => void;
}

export function useGeofencing(stations: Station[], completedStationIds: Set<string>): GeofencingState {
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [activeStation, setActiveStation] = useState<Station | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeStationRef = useRef<Station | null>(null);
  activeStationRef.current = activeStation;

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    async function start() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!cancelled) setPermissionDenied(true);
        return;
      }

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
        (location) => {
          if (cancelled) return;
          const here = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setPosition(here);

          // Keep showing the currently active task even if the player drifts
          // slightly out of radius while answering.
          if (activeStationRef.current) return;

          const nearby = stations
            .filter((station) => !completedStationIds.has(station.id))
            .find((station) => distanceMeters(here, station) <= station.radiusMeters);

          if (nearby) {
            setActiveStation(nearby);
          }
        }
      );
    }

    start().catch((err) => {
      if (!cancelled) setErrorMessage(getErrorMessage(err));
    });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [stations, completedStationIds]);

  return {
    position,
    activeStation,
    permissionDenied,
    errorMessage,
    closeActiveStation: () => setActiveStation(null),
  };
}
