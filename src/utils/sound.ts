import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

let stationAlertPlayer: AudioPlayer | null = null;
let successPlayer: AudioPlayer | null = null;

function getStationAlertPlayer(): AudioPlayer {
  if (!stationAlertPlayer) {
    stationAlertPlayer = createAudioPlayer(require('../../assets/sounds/station-alert.wav'));
  }
  return stationAlertPlayer;
}

function getSuccessPlayer(): AudioPlayer {
  if (!successPlayer) {
    successPlayer = createAudioPlayer(require('../../assets/sounds/success.wav'));
  }
  return successPlayer;
}

export function playStationAlert() {
  const player = getStationAlertPlayer();
  player.seekTo(0).catch(() => undefined);
  player.play();
}

export function playSuccessSound() {
  const player = getSuccessPlayer();
  player.seekTo(0).catch(() => undefined);
  player.play();
}
