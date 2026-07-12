import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

let stationAlertPlayer: AudioPlayer | null = null;

function getStationAlertPlayer(): AudioPlayer {
  if (!stationAlertPlayer) {
    stationAlertPlayer = createAudioPlayer(require('../../assets/sounds/station-alert.wav'));
  }
  return stationAlertPlayer;
}

export function playStationAlert() {
  const player = getStationAlertPlayer();
  player.seekTo(0).catch(() => undefined);
  player.play();
}
