import { useCallback, useMemo, useState } from 'react';

export function useProgress() {
  const [completedStationIds, setCompletedStationIds] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);

  const completeStation = useCallback((stationId: string, points: number) => {
    setCompletedStationIds((prev) => {
      if (prev.has(stationId)) return prev;
      const next = new Set(prev);
      next.add(stationId);
      return next;
    });
    setScore((prev) => prev + points);
  }, []);

  return useMemo(
    () => ({ completedStationIds, score, completeStation }),
    [completedStationIds, score, completeStation]
  );
}
