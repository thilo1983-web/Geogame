#!/usr/bin/env bash
# Auto-starts the Expo dev server with a tunnel on Codespace start/resume, so
# testing from a phone-only setup needs no terminal typing at all: just open
# expo-tunnel.log in the Explorer and copy the exp:// URL into Expo Go.
set -e
cd "$(dirname "$0")/.."

if pgrep -f "expo start" > /dev/null 2>&1; then
  echo "Expo dev server already running."
  exit 0
fi

nohup npx expo start --tunnel > expo-tunnel.log 2>&1 &
disown
echo "Expo dev server starting in the background. Open expo-tunnel.log for the QR code / exp:// URL."
