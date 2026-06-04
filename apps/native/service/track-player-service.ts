import TrackPlayer, { AppKilledPlaybackBehavior, Capability, Event, RepeatMode } from 'react-native-track-player';

export async function setupTrackPlayer() {
  let isSetup = false;
  try {
    await TrackPlayer.getActiveTrackIndex(); // Simple call to check if player is initialized
    isSetup = true;
  } catch {
    await TrackPlayer.setupPlayer({
       maxCacheSize: 1024 * 10,
    });
    
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play, 
        Capability.Pause, 
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      progressUpdateEventInterval: 2,
    });

    await TrackPlayer.setRepeatMode(RepeatMode.Queue);
    isSetup = true;
  }
  return isSetup;
}

export async function playbackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => TrackPlayer.seekTo(event.position));
}
