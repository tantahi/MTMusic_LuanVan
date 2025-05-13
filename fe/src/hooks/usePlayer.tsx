import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useRef, useEffect } from 'react';

export interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  audio: string;
  src: string;
  audio_url: string;
  cover: string;
}

const playlistAtom = atomWithStorage<Track[]>('playlist', []);
const queueAtom = atomWithStorage<Track[]>('queue', []);
const currentTrackIndexAtom = atomWithStorage<number>('currentTrackIndex', 0);
const isPlayingAtom = atomWithStorage<boolean>('isPlaying', false);
const currentTimeAtom = atomWithStorage<number>('currentTime', 0);
const durationAtom = atomWithStorage<number>('duration', 0);
const volumeAtom = atomWithStorage<number>('volume', 1);
const isRepeatAtom = atomWithStorage<boolean>('isRepeat', false);
const isRandomAtom = atomWithStorage<boolean>('isRandom', false);
const isQueueInitializedAtom = atomWithStorage<boolean>('isQueueInitialized', false);

export function usePlayerStore() {
  const [playlist, setPlaylist] = useAtom(playlistAtom);
  const [queue, setQueue] = useAtom(queueAtom);
  const [currentTrackIndex, setCurrentTrackIndex] = useAtom(currentTrackIndexAtom);
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);
  const [duration, setDuration] = useAtom(durationAtom);
  const [volume, setVolume] = useAtom(volumeAtom);
  const [isRepeat, setIsRepeat] = useAtom(isRepeatAtom);
  const [isRandom, setIsRandom] = useAtom(isRandomAtom);
  const [isQueueInitialized, setIsQueueInitialized] = useAtom(isQueueInitializedAtom);

  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = queue[currentTrackIndex];

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const seekTime = (newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const changeTrack = (direction: 'next' | 'prev', index?: number) => {
    let newIndex = currentTrackIndex;

    if (typeof index === 'number') {
      newIndex = index;
    } else if (isRandom) {
      newIndex = Math.floor(Math.random() * queue.length);
    } else {
      if (direction === 'next') {
        newIndex = (currentTrackIndex + 1) % queue.length;
      } else {
        newIndex = (currentTrackIndex - 1 + queue.length) % queue.length;
      }
    }

    setCurrentTrackIndex(newIndex);
    setIsPlaying(true);
  };

  const toggleRepeat = () => setIsRepeat(!isRepeat);
  const toggleRandom = () => setIsRandom(!isRandom);

  const addToQueue = (tracks: Track[]) => {
    if (!isQueueInitialized) {
      setQueue(tracks);
      setIsQueueInitialized(true);
    } else {
      setQueue((prev) => {
        const newTracks = tracks.filter((track) => !prev.some((t) => t.id === track.id));
        return [...prev, ...newTracks];
      });
    }
  };

  const updatePlaylist = (newTracks: Track[]) => {
    setPlaylist(newTracks);
    setQueue(newTracks);
    setIsQueueInitialized(true);
  };

  const playTrack = (index: number, newPlaylist?: Track[]) => {
    if (newPlaylist) {
      updatePlaylist(newPlaylist);
    }
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (audioRef.current) {
      const handleTimeUpdate = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          setDuration(audioRef.current.duration);
        }
      };
      
      const handleEnded = () => {
        if (isRepeat) {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          }
        } else {
          changeTrack('next');
        }
      };

      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('ended', handleEnded);

      return () => {
        audioRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current?.removeEventListener('ended', handleEnded);
      };
    }
  }, [isRepeat]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audio || currentTrack.src || currentTrack.audio_url;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrackIndex, currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.currentTime = currentTime;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, []);

  return {
    playlist,
    queue,
    currentTrackIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    currentTrack,
    audioRef,
    isRepeat,
    isRandom,
    isQueueInitialized,
    togglePlay,
    handleVolumeChange,
    seekTime,
    changeTrack,
    toggleRepeat,
    toggleRandom,
    addToQueue,
    updatePlaylist,
    playTrack,
  };
}