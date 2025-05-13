'use client';

import React, { useState } from 'react';
import { Play, ChevronRight, Heart, Plus, DollarSign, Percent } from 'lucide-react';
import { Modal, Dropdown, Menu, message, Button } from 'antd';
import { usePlayerStore } from '@/hooks/usePlayer';
import Link from 'next/link';
import mediaService from '@/services/media.service';
import { useAtomValue } from 'jotai';
import { tokenAtom, userAtom } from '@/lib/atom/user.atom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentModal } from '@/components/UserComponent/PaymentModal';
import PurchaseModal from '@/components/UserComponent/PurchaseModal';


const stripePromise = loadStripe(
  'pk_test_51Ptwd9RuwfSTMxXEDOg4yP9eGWjHnxiOMVxnkUgTHVe8XHuY5yuVa13zSlX6sR1PGNqnHidjAGFzS4HiSIkDrDXB00gbiW5VjL'
);

interface Track {
  id: number;
  title: string;
  artist: string;
  creator?: string;
  cover: string;
  audio: string;
  duration?: string;
  createdBy: number;
  isLike: boolean;
  isBuy: boolean;
  price: number;
  similarityScore?: number;
}

interface Playlist {
  id: number;
  name: string;
  songsCount: number;
  createdAt: string;
}

interface TrackListProps {
  tracks: Track[];
  playlists?: Playlist[];
  title?: string;
  onAddTrack?: (track: Track) => void;
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
  onFavoriteToggle?: () => void;
}

interface UserType {
  id: number;
  email: string;
  password: string;
  full_name: string;
  birthday?: Date | null;
  address?: string | null;
  img_url?: string | null;
  role: 'Admin' | 'Staff' | 'User' | 'Vip User';
  status?: 'Active' | 'Inactive' | 'Banned';
  created_at: Date;
  updated_at: Date;
  vip_start_date?: Date | null;
  vip_end_date?: Date | null;
  deleted_at?: Date | null;
  report_count?: number | null;
  paypalAccountId: any;
  paypalEmail: any;
}

export default function TrackList({ tracks, playlists = [], title, onAddTrack, setTracks, onFavoriteToggle }: TrackListProps) {
  const { playlist, queue, currentTrackIndex, isPlaying, currentTime, duration, volume, currentTrack, audioRef, isRepeat, isRandom, isQueueInitialized, togglePlay, handleVolumeChange, seekTime, changeTrack, toggleRepeat, toggleRandom, addToQueue, updatePlaylist, playTrack } = usePlayerStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const token = useAtomValue(tokenAtom);
  const user = useAtomValue(userAtom) as UserType;

  const showModal = (track: Track) => {
    setSelectedTrack(track);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedTrack(null);
  };

  const handleAddToPlaylist = (playlistName: string) => {
    if (selectedTrack && onAddTrack) {
      onAddTrack(selectedTrack);
    }
    setIsModalOpen(false);
  };

  const handlePlayTrack = (e: React.MouseEvent, track: Track, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (track.price > 0 && !track.isBuy && user.role !== 'Vip User') {
      setSelectedTrack(track);
      setIsUpgradeModalOpen(true);
    } else {
      updatePlaylist(tracks);
      playTrack(index);
    }
  };
  const updatePurchasedTrackState = (trackId: string) => {
    // setTracks(prevTracks =>
    //   prevTracks.map(track =>
    //     track.id.toString() === trackId ? { ...track, isBuy: true } : track
    //   )
    // );
    // message.success('Purchase successful!')
  };

  const handleToggleFavorite = async (e: React.MouseEvent, track: Track) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistically update the UI
    const updatedTracks = tracks.map(t => 
      t.id === track.id ? { ...t, isLike: !t.isLike } : t
    );
    setTracks(updatedTracks);

    try {
      if (!track.isLike) {
        await mediaService.addToFavourite(track.id, token);
        message.success(`Added "${track.title}" to favorites`);
      } else {
        await mediaService.deleteFavourite(track.id, token);
        message.success(`Removed "${track.title}" from favorites`);
      }

      if (isQueueInitialized && isPlaying && currentTrack && currentTrack.id === track.id) {
        addToQueue(updatedTracks);
      }

      if (onFavoriteToggle) {
        onFavoriteToggle();
      }
    } catch (error) {
      console.error('Failed to toggle favorite status:', error);
      message.error('Failed to update favorite status');
      
      // Revert the optimistic update if the API call fails
      setTracks(tracks);
    }
  };

  const menu = (
    <Menu>
      {playlists.length > 0 ? (
        playlists.map((playlist) => (
          <Menu.Item
            key={playlist.id}
            onClick={() => handleAddToPlaylist(playlist.name)}
          >
            {playlist.name}
          </Menu.Item>
        ))
      ) : (
        <Menu.Item disabled>No playlists available</Menu.Item>
      )}
    </Menu>
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModalVip = () => {
    setIsModalVisible(true);
  };

  const handleCancelVip = () => {
    setIsModalVisible(false);
  };

  return (
    <section className="mb-8 mt-3">
      <Elements stripe={stripePromise} key="upgrade">
        <PaymentModal visible={isModalVisible} onCancel={handleCancelVip} />
      </Elements>
      <h2 className="mb-4 text-2xl font-bold text-onNeutralBg dark:text-dark-onNeutralBg">
        {title ? title : ''}
      </h2>
      <div className="rounded-lg bg-cardBg p-4 dark:bg-dark-cardBg">
        <ul className="flex w-full list-none flex-col">
          {tracks.map((track, index) => (
            <Link
              href={`/home/song/${track.id}`}
              key={track.id}
              className={`group relative flex cursor-pointer items-center p-3 text-base text-onNeutralBg hover:rounded hover:bg-cardBgHover dark:text-dark-onNeutralBg dark:hover:bg-dark-cardBgHover ${
                index !== 0
                  ? 'border-t border-onNeutralBgDivider dark:border-dark-onNeutralBgDivider'
                  : ''
              } ${
                currentTrack && currentTrack.id === track.id
                  ? 'bg-primary/10 dark:bg-dark-primary/10'
                  : ''
              }`}
            >
              <div className="items-between group relative flex w-full justify-center">
                <div className="xs:gap-4 flex flex-1 items-center justify-start gap-2">
                  <span className="xs:mr-2 mr-0 block text-sm">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="relative h-12 w-12">
                    <div className="absolute h-full w-full bg-transparent group-hover:bg-black group-hover:opacity-70"></div>
                    <img
                      src={track.cover}
                      alt={track.title}
                      className="aspect-square h-full w-full rounded"
                    />
                    <div className="absolute top-0 flex h-full w-full items-center justify-center">
                      <button
                        type="button"
                        className="hidden h-7 w-7 items-center justify-center rounded-full bg-primary text-neutralBgAlt group-hover:flex dark:bg-dark-primary dark:text-dark-neutralBgAlt"
                        onClick={(e) => handlePlayTrack(e, track, index)}
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex w-full flex-1 flex-col gap-1">
                    <span className="text-sm text-onNeutralBg dark:text-dark-onNeutralBg">
                      {track.title}
                      {track.price > 0 && !track.isBuy && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-primary px-2 py-1 text-xs font-medium text-white">
                          {user.role === 'Vip User' ? (
                            'VIP'
                          ) : (
                            <>
                              <DollarSign className="mr-1 h-3 w-3" />
                              {(track.price / 100).toFixed(2)}
                            </>
                          )}
                        </span>
                      )}
                      {track.isBuy && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white">
                          Purchased
                        </span>
                      )}
                      {track.similarityScore !== undefined && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white">
                          <Percent className="mr-1 h-3 w-3" />
                          {(track.similarityScore * 100).toFixed(2)}% similar
                        </span>
                      )}
                    </span>
                    <div className="xs:flex-row flex flex-col">
                      <Link
                        href={`/home/artist/${track.createdBy}`}
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-pointer text-xs text-onNeutralBgSecondary underline-offset-4 hover:underline dark:text-dark-onNeutralBgSecondary"
                      >
                        {track.artist} - {track.creator}
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="absolute right-0 flex items-center gap-2">
                  <div className="flex items-end justify-end text-right text-sm text-onNeutralBgSecondary dark:text-dark-onNeutralBgSecondary">
                    {track.duration}
                  </div>
                  <button
                    type="button"
                    className={`p-2 transition-colors duration-200 ${
                      track.isLike
                        ? 'text-primary dark:text-dark-primary'
                        : 'text-onNeutralBgSecondary hover:text-primary dark:text-dark-onNeutralBgSecondary dark:hover:text-dark-primary'
                    }`}
                    title={track.isLike ? 'Unlike' : 'Like'}
                    onClick={(e) => handleToggleFavorite(e, track)}
                  >
                    <Heart className={`h-5 w-5 ${track.isLike ? 'fill-current' : ''}`} />
                  </button>
                  {onAddTrack && (
                    <button
                      type="button"
                      className="p-2 text-onNeutralBgSecondary transition-colors duration-200 hover:text-primary dark:text-dark-onNeutralBgSecondary dark:hover:text-dark-primary"
                      title="Add to playlist"
                      onClick={(e) => {
                        e.preventDefault();
                        showModal(track);
                      }}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </ul>
      </div>

      <Modal
        title="Add to playlist"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <p>Which playlist would you like to add this song to?</p>
        <Dropdown overlay={menu} trigger={['click']}>
          <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
            Select playlist <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </Dropdown>
      </Modal>

      <Modal
        title="Purchase Options"
        open={isUpgradeModalOpen}
        onCancel={() => setIsUpgradeModalOpen(false)}
        footer={null}
      >
        <p>This song is only available for VIP users or through individual purchase. Please choose an option:</p>
        <div className="mt-4 flex justify-between">
          <Button onClick={() => {
            setIsUpgradeModalOpen(false);
            showModalVip();
          }}>
            Upgrade to VIP
          </Button>
          {selectedTrack && (
            <PurchaseModal
              price={selectedTrack.price / 100}
              itemId={selectedTrack.id.toString()}
              itemType="Song"
              onSuccess={(itemId) => {
                updatePurchasedTrackState(selectedTrack.id.toString());
                setIsUpgradeModalOpen(false);
              }}
            />
          )}
        </div>
      </Modal>
    </section>
  );
}

