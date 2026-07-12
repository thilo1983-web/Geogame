import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import { getErrorMessage } from '../utils/errors';

export function useHeading() {
  const [heading, setHeading] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    Location.watchHeadingAsync((event) => {
      if (cancelled) return;
      setHeading(event.trueHeading >= 0 ? event.trueHeading : event.magHeading);
    })
      .then((sub) => {
        if (cancelled) {
          sub.remove();
        } else {
          subscription = sub;
        }
      })
      .catch((err) => {
        if (!cancelled) setErrorMessage(getErrorMessage(err));
      });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return { heading, errorMessage };
}
