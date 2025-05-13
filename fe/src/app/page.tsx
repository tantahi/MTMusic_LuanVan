'use client'

import React, { useState, useEffect } from 'react'
import RecenlyPlayedSection from '@/components/RecentlyPlayedSection';
import AlbumSection from '@/components/AlbumSection';
import TrackList from '@/components/TrackList';
import AllSongs from '@/components/UserComponent/AllSongComponent';

export default function PlaylistAlbumManager() {
    const topTracks = [
        {
          id: 1,
          title: 'Die With A Smile',
          artist: 'Lady Gaga',
          duration: '04:11',
          src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          cover: 'https://e-cdns-images.dzcdn.net/images/cover/4bd5903f4ce8f2601916bfadb44efe8a/500x500-000000-80-0-0.jpg',
        },
        {
          id: 2,
          title: 'Poker Face',
          artist: 'Lady Gaga',
          duration: '03:57',
          src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          cover: 'https://e-cdns-images.dzcdn.net/images/cover/fad7de079aa103d60ec1e2d1582c2281/500x500-000000-80-0-0.jpg',
        },
        {
          id: 3,
          title: 'Always Remember Us This Way',
          artist: 'Lady Gaga',
          duration: '03:30',
          src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          cover: 'https://e-cdns-images.dzcdn.net/images/cover/88a8288e14f61ffa39c14ac2ef9210d8/500x500-000000-80-0-0.jpg',
        },
        {
          id: 4,
          title: 'Shallow',
          artist: 'Lady Gaga',
          duration: '03:36',
          src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          cover: 'https://e-cdns-images.dzcdn.net/images/cover/88a8288e14f61ffa39c14ac2ef9210d8/500x500-000000-80-0-0.jpg',
        },
        {
          id: 5,
          title: 'Just Dance',
          artist: 'Lady Gaga',
          duration: '04:04',
          src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          cover: 'https://e-cdns-images.dzcdn.net/images/cover/fad7de079aa103d60ec1e2d1582c2281/500x500-000000-80-0-0.jpg',
        },
      ];
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
      <RecenlyPlayedSection/>
      <AlbumSection/>
      <AllSongs></AllSongs>
    </div>
  )
}