'use client';
import React, { useEffect } from 'react';
import { useGlobalAudioPlayer } from 'react-use-audio-player';
import { truncate, classNames } from '@/lib/utils';
import usePlayer from '@/hooks/usePlayer';
import Icon from '@/components/Icon';
import PlayerProgressBar from '@/components/Player/PlayerProgressBar'; // Import PlayerProgressBar
import { Button } from 'antd';

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
  created_at: Date;
}

export default function TestPlayerComponent() {
  console.log('Rerender test');

  const {
    handleUpdateTrackIndex,
    handlePlayPause,
    handleNext,
    handlePrev,
    handleSetVolume,
    handleVolumeMute,
    handleSeek,
    handleLoop,
    handleShuffle,
    progressBarWidth,
    currentTrack,
    tracklist,
    volume,
    isPlaying,
    stop,
    audio_url,
    getTimer,
    audioBarContainerRef,
    isLooping,
    isShuffle,
    initializePlayer,
  } = usePlayer();

  const mockTracks: Track[] = [
    {
      id: 1,
      name: 'Track 1',
      artist_name: 'Artist 1',
      audio_url:
        'https://cdn.freesound.org/previews/752/752290_16215433-lq.mp3',
      media_type: 'Podcast',
      genre: 'Pop',
    },
    {
      id: 2,
      name: 'Track 2',
      artist_name: 'Artist 2',
      audio_url: 'https://cdn.freesound.org/previews/752/752272_2250422-lq.mp3',
      media_type: 'Podcast',
      genre: 'Jazz',
    },
  ];

  const handleClick = () => {
    initializePlayer({
      tracklist: mockTracks,
      trackIndex: 0,
      volume: 0.5,
      autoplay: true,
      loop: false,
    });
  };

  return (
    <div>
      <h1>Test Player</h1>
      <div>
        <h2>Current Track</h2>
        {currentTrack ? (
          <>
            <p>Name: {currentTrack.name}</p>
            <p>Artist: {currentTrack.artist_name}</p>
          </>
        ) : (
          <p>
            No track playing <button onClick={handleClick}>đây</button>
          </p>
        )}
      </div>
      <div>
        <button onClick={handlePlayPause}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={handleNext}>Next</button>
        <button onClick={handlePrev}>Previous</button>
        <button onClick={handleVolumeMute}>Mute/Unmute</button>
        <button onClick={handleLoop}>
          {isLooping ? 'Disable Loop' : 'Enable Loop'}
        </button>
        <button onClick={handleShuffle}>
          {isShuffle ? 'Disable Shuffle' : 'Enable Shuffle'}
        </button>
      </div>

      {/* Use the PlayerProgressBar component */}
      <PlayerProgressBar
        audioBarContainerRef={audioBarContainerRef}
        handleSeek={handleSeek}
        progressBarWidth={progressBarWidth}
      />

      <div>
        <p>Volume: {volume}</p>
        <p>Timer: {getTimer}</p>
      </div>
    </div>
  );
}
