'use client'

import React, { useState, useEffect } from 'react'
import AlbumSection from '@/components/AlbumSection';
import BannerSlider from '@/components/MusicBannerSlider';
import TrackList from '@/components/TrackList';
import AllSongs from '@/components/UserComponent/AllSongComponent';
import TopFollowedUsers from '@/components/TopFollowedUser';

export default function PlaylistAlbumManager() {
      interface Playlist {
        id: number;
        name: string;
        songsCount: number;
        createdAt: string;
      }
      const fakePlaylists: Playlist[] = [
        { id: 1, name: 'Yêu thích', songsCount: 10, createdAt: '2023-08-01' },
        { id: 2, name: 'Nghe khi học', songsCount: 8, createdAt: '2023-08-10' },
        { id: 3, name: 'Chill', songsCount: 15, createdAt: '2023-07-22' },
      ];
  return (
        <div className="">
      <BannerSlider/>
      <AlbumSection/>
      <TopFollowedUsers></TopFollowedUsers>
      <AllSongs></AllSongs>
    </div>
  )
}