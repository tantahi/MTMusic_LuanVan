// src/lib/playerStore.ts
import { atom, useAtom } from 'jotai';

export interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  cover: string;
  src: string;
}

const playlistAtom = atom<Track[]>([]);
const currentTrackIndexAtom = atom<number>(0);
const isPlayingAtom = atom<boolean>(false);

export function usePlayerStore() {
  const [playlist, setPlaylist] = useAtom(playlistAtom);
  const [currentTrackIndex, setCurrentTrackIndex] = useAtom(currentTrackIndexAtom);
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);

  const addToPlaylist = (track: Track) => {
    setPlaylist((prev) => [...prev, track]);
  };

  const playTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  return {
    playlist,
    currentTrackIndex,
    isPlaying,
    addToPlaylist,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
  };
}