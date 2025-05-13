import { atom } from 'jotai';

export interface Track {
  id: number;
  title: string;
  artist: string;
  src: string;
}

interface AudioState {
  tracks: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
}

const initialState: AudioState = {
  tracks: [],
  currentTrackIndex: 0,
  isPlaying: false,
  volume: 1,
  currentTime: 0,
  duration: 0,
};

export const audioStateAtom = atom<AudioState>(initialState);
