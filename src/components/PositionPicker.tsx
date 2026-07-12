import MapView, { Circle, Marker, Region } from 'react-native-maps';
import { StyleSheet } from 'react-native';

interface PositionPickerProps {
  coordinate: { latitude: number; longitude: number };
  radiusMeters: number;
  onChange: (coordinate: { latitude: number; longitude: number }) => void;
}

export function PositionPicker({ coordinate, radiusMeters, onChange }: PositionPickerProps) {
  const region: Region = {
    ...coordinate,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <MapView style={styles.map} region={region}>
      <Marker
        coordinate={coordinate}
        draggable
        onDragEnd={(e) => onChange(e.nativeEvent.coordinate)}
      />
      <Circle
        center={coordinate}
        radius={radiusMeters}
        strokeColor="#2E6BE6"
        fillColor="#2E6BE633"
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
});
