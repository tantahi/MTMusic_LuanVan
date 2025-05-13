import React from 'react';
import usePlayer from '@/hooks/usePlayer';

interface PlayerProgressBarProps {
  audioBarContainerRef: React.RefObject<HTMLDivElement>;
  handleSeek: (event: React.MouseEvent) => void;
  progressBarWidth: number;
}

const PlayerProgressBar: React.FC<PlayerProgressBarProps> = () => {
  const {
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
  return (
    <div
      className="bg-player h-1 w-full cursor-pointer rounded-full"
      ref={audioBarContainerRef}
      onClick={handleSeek}
    >
      Hello
      <div style={{ width: `100%` }} className="h-1 rounded-full bg-primary" />
    </div>
  );
};

export default PlayerProgressBar;
