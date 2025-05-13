export interface Track {
  id: number;
  name: string;
  artist_name: string;
  audio_url: string;
  media_type: 'Song' | 'Podcast';
  genre: 'Pop' | 'Rap' | 'Jazz' | 'Classical';
}

export interface PlaylistDetails {
  id: number;
  name: string;
  genre: 'Pop' | 'Rap' | 'Jazz' | 'Classical';
  type: 'Album' | 'Playlist';
  created_at: Date;
}

export const mockTracks: Track[] = [
  {
    id: 1,
    name: 'Track 1',
    artist_name: 'Artist 1',
    audio_url: 'https://example.com/audio1.mp3',
    media_type: 'Song',
    genre: 'Pop',
  },
  {
    id: 2,
    name: 'Track 2',
    artist_name: 'Artist 2',
    audio_url: 'https://example.com/audio2.mp3',
    media_type: 'Song',
    genre: 'Jazz',
  },
  // Thêm nhiều track giả nếu cần
];

export const mockPlaylistDetails: PlaylistDetails = {
  id: 1,
  name: 'Playlist 1',
  genre: 'Pop',
  type: 'Album',
  created_at: new Date(),
};

// Define types for player state
interface PlayerState {
  tracklist: Track[];
  currentPlaylist: PlaylistDetails | null;
  trackIndex: number;
  trackId: number | null;
  isTrackPlaying: boolean;
  isLooping: boolean;
  isShuffle: boolean;
}
