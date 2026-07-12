import { Fragment } from 'react';
import MapView, { Circle, Marker, Region } from 'react-native-maps';
import { StyleSheet } from 'react-native';

import { StationMarkerIcon } from './StationMarker';
import type { Station } from '../types/game';

interface StationMapProps {
  stations: Station[];
  completedStationIds?: Set<string>;
  playerPosition?: { latitude: number; longitude: number } | null;
  initialRegion: Region;
  onMapPress?: (coordinate: { latitude: number; longitude: number }) => void;
  onStationPress?: (station: Station) => void;
  pendingMarker?: { latitude: number; longitude: number } | null;
}

export function StationMap({
  stations,
  completedStationIds,
  playerPosition,
  initialRegion,
  onMapPress,
  onStationPress,
  pendingMarker,
}: StationMapProps) {
  return (
    <MapView
      style={styles.map}
      initialRegion={initialRegion}
      onPress={onMapPress ? (e) => onMapPress(e.nativeEvent.coordinate) : undefined}
    >
      {stations.map((station) => {
        const isCompleted = completedStationIds?.has(station.id) ?? false;
        const color = isCompleted ? '#4CAF50' : '#2E6BE6';
        return (
          <Fragment key={station.id}>
            <Marker
              coordinate={station}
              title={station.name}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={onStationPress ? () => onStationPress(station) : undefined}
            >
              <StationMarkerIcon completed={isCompleted} />
            </Marker>
            <Circle
              center={station}
              radius={station.radiusMeters}
              strokeColor={color}
              fillColor={`${color}33`}
            />
          </Fragment>
        );
      })}

      {pendingMarker && <Marker coordinate={pendingMarker} pinColor="orange" />}

      {playerPosition && (
        <Marker coordinate={playerPosition} title="Du" pinColor="#2E6BE6" />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
