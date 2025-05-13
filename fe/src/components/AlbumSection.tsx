'use client'

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, Spin } from 'antd';
import { ChevronRight, Play, Disc } from 'lucide-react';
import { useAtomValue } from 'jotai';
import { tokenAtom } from '@/lib/atom/user.atom';
import Link from 'next/link';

interface Album {
  id: number;
  name: string;
  genre: string;
  artist_name: string | null;
  img_url: string | null;
  type: string;
  price: number | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  User: {
    id: number;
    full_name: string;
    email: string;
  };
  song_count: number;
}

function AlbumCard({ album }: { album: Album }) {
  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Add your play functionality here
    console.log('Play album:', album.name);
  };

  return (
    <Link href={`/home/album/${album.id}`} className="block">
      <div className="group relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl">
        <div className="aspect-square">
          <img
            src={album.img_url ? `http://localhost:3001${album.img_url}` : '/placeholder.svg'}
            alt={album.name}
            className="h-full w-full object-cover transition-all duration-300 ease-in-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transition-all duration-300 ease-in-out group-hover:bottom-4 group-hover:opacity-100">
          <h3 className="text-lg font-bold leading-tight">{album.name}</h3>
          <p className="mt-1 text-sm">{album.artist_name || 'Unknown Artist'}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="flex items-center text-xs">
              <Disc className="mr-1 h-4 w-4" /> {album.song_count} songs
            </span>
            <Button
              type="primary"
              shape="circle"
              icon={<Play className="ml-1" size={16} />}
              className="flex h-8 w-8 items-center justify-center bg-white text-black hover:bg-white/90"
              onClick={handlePlayClick}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function AlbumSection() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [displayCount, setDisplayCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const token = useAtomValue(tokenAtom);

  const fetchAlbums = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/media/playlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const albumData = response.data.data.filter((item: Album) => item.type === 'Album');
        setAlbums(albumData);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchAlbums();
    }
  }, [token, fetchAlbums]);

  const loadMore = () => {
    setDisplayCount(prevCount => prevCount + 10);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="media_content p-6 mt-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-onNeutralBg">Albums</h2>
        {displayCount < albums.length && (
          <Button
            type="default"
            onClick={loadMore}
            className="flex items-center justify-between gap-1 rounded-full border-primary px-4 py-2 text-sm font-medium text-primary transition-all duration-300 hover:bg-primary hover:text-white"
          >
            See more <ChevronRight className="ml-1" size={16} />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {albums.slice(0, displayCount).map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
      {displayCount < albums.length && (
        <div className="mt-8 flex justify-center">
          <Button
            type="default"
            onClick={loadMore}
            className="flex items-center justify-between gap-1 rounded-full border-primary px-6 py-3 text-base font-medium text-primary transition-all duration-300 hover:bg-primary hover:text-white"
          >
            Load more albums <ChevronRight className="ml-1" size={20} />
          </Button>
        </div>
      )}
    </div>
  );
}

