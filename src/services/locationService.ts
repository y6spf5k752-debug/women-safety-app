import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentLocation(): Promise<LocationData | null> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return null;

  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || undefined,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
}

export async function watchLocation(
  callback: (location: LocationData) => void
): Promise<Location.LocationSubscription | null> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return null;

  return await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
    },
    (location) => {
      callback({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      });
    }
  );
}

export function getGoogleMapsUrl(location: LocationData): string {
  return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
}
