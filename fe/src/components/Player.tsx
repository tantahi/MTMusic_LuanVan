'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  List,
  Repeat,
  Shuffle,
} from 'lucide-react';
import { usePlayerStore } from '@/hooks/usePlayer';
import * as SliderPrimitive from '@radix-ui/react-slider';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={`relative flex touch-none select-none ${props.orientation === 'vertical' ? 'h-full flex-col' : 'w-full'} ${className}`}
    {...props}
  >
    <SliderPrimitive.Track
      className={`relative ${props.orientation === 'vertical' ? 'h-full w-1.5' : 'h-1.5 w-full'} overflow-hidden rounded-full bg-onNeutralBgDivider dark:bg-dark-onNeutralBgDivider`}
    >
      <SliderPrimitive.Range
        className={`absolute ${props.orientation === 'vertical' ? 'w-full' : 'h-full'} bg-primary dark:bg-dark-primary`}
      />
    </SliderPrimitive.Track>
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

const MyPlayer: React.FC = () => {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    currentTrack,
    audioRef,
    isRepeat,
    isRandom,
    queue,
    togglePlay,
    handleVolumeChange,
    seekTime,
    changeTrack,
    toggleRepeat,
    toggleRandom,
    playTrack,
  } = usePlayerStore();

  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [isVolumeVisible, setIsVolumeVisible] = useState(false);
  const volumeRef = useRef<HTMLDivElement>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        volumeRef.current &&
        !volumeRef.current.contains(event.target as Node)
      ) {
        setIsVolumeVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full bg-neutralBgAlt p-4 text-onNeutralBg shadow-lg dark:bg-dark-neutralBgAlt dark:text-dark-onNeutralBg">
      <audio ref={audioRef} />

      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex w-1/4 items-center space-x-4">
          <img
            src={currentTrack?.cover || 'https://picsum.photos/seed/1/50/50'}
            alt="Album cover"
            className="h-12 w-12 rounded-md shadow-md"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">
              {currentTrack?.title || 'No track selected'}
            </h3>
            <p className="truncate text-sm text-onNeutralBgSecondary dark:text-dark-onNeutralBgSecondary">
              {currentTrack?.artist || 'Unknown artist'}
            </p>
          </div>
        </div>

        <div className="flex w-1/2 flex-col items-center space-y-2">
          <div className="flex items-center space-x-4">
            <button
              className={`focus:outline-none ${isRandom ? 'text-primary dark:text-dark-primary' : ''}`}
              onClick={toggleRandom}
              aria-label="Toggle random"
            >
              <Shuffle size={20} />
            </button>
            <button
              className="focus:outline-none"
              onClick={() => changeTrack('prev')}
              aria-label="Previous track"
            >
              <SkipBack size={20} />
            </button>
            <button
              className="rounded-full bg-primary p-2 text-white transition-colors hover:bg-primary-light-gray focus:outline-none dark:bg-dark-primary dark:hover:bg-dark-primary-light-gray"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              className="focus:outline-none"
              onClick={() => changeTrack('next')}
              aria-label="Next track"
            >
              <SkipForward size={20} />
            </button>
            <button
              className={`focus:outline-none ${isRepeat ? 'text-primary dark:text-dark-primary' : ''}`}
              onClick={toggleRepeat}
              aria-label="Toggle repeat"
            >
              <Repeat size={20} />
            </button>
          </div>
          <div className="flex w-full items-center space-x-2">
            <span className="text-xs">{formatTime(currentTime)}</span>
            <Slider
              min={0}
              max={duration || 100}
              value={[currentTime]}
              onValueChange={(values) => seekTime(values[0])}
              className="w-full"
              aria-label="Seek time"
            />
            <span className="text-xs">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex w-1/4 items-center justify-end space-x-4">
          <div className="group relative flex" ref={volumeRef}>
            <button
              className="focus:outline-none"
              onClick={() => setIsVolumeVisible(!isVolumeVisible)}
              aria-label="Adjust volume"
            >
              <Volume2 size={20} />
            </button>
            {isVolumeVisible && (
              <div className="absolute bottom-8 left-1/2 h-24 -translate-x-1/2 transform rounded-lg bg-cardBg p-2 shadow-lg dark:bg-dark-cardBg">
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[volume]}
                  onValueChange={(values) => handleVolumeChange(values[0])}
                  orientation="vertical"
                  className="h-24"
                  aria-label="Adjust volume"
                />
              
              </div>
            )}
          </div>
          <button
            className="relative focus:outline-none"
            onClick={() => setIsQueueVisible(!isQueueVisible)}
            aria-label="Toggle queue"
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {isQueueVisible && (
        <div className="absolute bottom-full right-[280px] max-h-96 w-64 overflow-y-auto rounded-t-lg bg-cardBg p-4 shadow-lg dark:bg-dark-cardBg">
          <h4 className="mb-2 font-semibold">Queue</h4>
          <ul className="space-y-2">
            {queue.map((track, index) => (
              <li
                key={`${track.id}-${index}`}
                className={`flex cursor-pointer items-center space-x-2 rounded p-1 hover:bg-cardBgHover dark:hover:bg-dark-cardBgHover ${
                  currentTrack && currentTrack.id === track.id
                    ? 'bg-primary/10 dark:bg-dark-primary/10'
                    : ''
                }`}
                onClick={() => playTrack(index)}
              >
                <span className="text-sm font-medium">{index + 1}.</span>
                <span className="truncate text-sm">
                  {track.title} - {track.artist}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MyPlayer;