import { StyleSheet, Text, View } from 'react-native';

interface ScoreHeaderProps {
  score: number;
  completedCount: number;
  totalCount: number;
}

export function ScoreHeader({ score, completedCount, totalCount }: ScoreHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.score}>{score} Punkte</Text>
      <Text style={styles.progress}>
        {completedCount} / {totalCount} Stationen
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  score: {
    fontSize: 18,
    fontWeight: '700',
  },
  progress: {
    fontSize: 14,
    color: '#666',
  },
});
