import { StyleSheet, Text, View } from 'react-native';

interface StationMarkerIconProps {
  completed: boolean;
}

export function StationMarkerIcon({ completed }: StationMarkerIconProps) {
  return (
    <View style={styles.wrapper}>
      <View style={[styles.pin, completed && styles.pinCompleted]}>
        <Text style={styles.pinGlyph}>📍</Text>
        {completed && (
          <View style={styles.crossOverlay} pointerEvents="none">
            <View style={[styles.crossBar, styles.crossBarA]} />
            <View style={[styles.crossBar, styles.crossBarB]} />
          </View>
        )}
      </View>
    </View>
  );
}

const PIN_SIZE = 34;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinCompleted: {
    opacity: 0.55,
  },
  pinGlyph: {
    fontSize: PIN_SIZE * 0.85,
  },
  crossOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossBar: {
    position: 'absolute',
    width: PIN_SIZE * 0.9,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D32F2F',
    borderWidth: 1,
    borderColor: 'white',
  },
  crossBarA: {
    transform: [{ rotate: '45deg' }],
  },
  crossBarB: {
    transform: [{ rotate: '-45deg' }],
  },
});
