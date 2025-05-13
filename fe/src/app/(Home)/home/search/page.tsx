'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Input, Spin } from 'antd'
import axios from 'axios'
import TrackList from '@/components/TrackList'
import { usePlayerStore } from '@/hooks/usePlayer'
import { useAtomValue } from 'jotai'
import { tokenAtom, userAtom } from '@/lib/atom/user.atom'

const { Search } = Input

interface Track {
  id: number
  name: string
  artist_name: string
  img_url: string
  audio_url: string
  duration: string
  description: string
  lyric: string
  media_type: string
  genre: string
  likes_count: number
  comments_count: number
  reports_count: number
  price: string
  createdBy: number
  status: string
  isLike: boolean
  isBuy: boolean
  creator: {
    id: number
    full_name: string
    email: string
    img_url: string | null
  }
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [searchTerm, setSearchTerm] = useState(initialQuery)
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { playTrack, updatePlaylist } = usePlayerStore()
  const token = useAtomValue(tokenAtom)
  const user = useAtomValue(userAtom)

  const searchTracks = async (query: string) => {
    if (!query.trim() || !token) return
    setIsLoading(true)
    try {
      const response = await axios.get(`http://localhost:3001/media/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: query, userId: user.id }
      })
      if (response.data.success) {
        setTracks(response.data.data)
        updatePlaylist(response.data.data)
      }
    } catch (error) {
      console.error('Error searching tracks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery) {
      searchTracks(initialQuery)
    }
  }, [initialQuery])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    searchTracks(value)
  }

  const handlePlayTrack = (track: Track, index: number) => {
    const formattedTracks = tracks.map(t => ({
      id: t.id,
      title: t.name,
      artist: t.artist_name,
      cover: `http://localhost:3001${t.img_url}`,
      src: `http://localhost:3001${t.audio_url}`,
      duration: t.duration,
      description: t.description,
      lyric: t.lyric,
      mediaType: t.media_type,
      genre: t.genre,
      likesCount: t.likes_count,
      commentsCount: t.comments_count,
      reportsCount: t.reports_count,
      price: t.price,
      createdBy: t.createdBy,
      status: t.status,
      isLike: t.isLike,
      isBuy: t.isBuy,
      creator: t.creator
    }))
    playTrack(index, formattedTracks)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Search Tracks</h1>
      <Search
        placeholder="Search for tracks"
        allowClear
        enterButton="Search"
        size="large"
        onSearch={handleSearch}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6"
      />
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : tracks.length > 0 ? (
        <TrackList
          tracks={tracks.map(track => ({
            id: track.id,
            title: track.name,
            artist: track.artist_name,
            cover: `http://localhost:3001${track.img_url}`,
            audio: `http://localhost:3001${track.audio_url}`,
            duration: track.duration,
            description: track.description,
            lyric: track.lyric,
            mediaType: track.media_type,
            genre: track.genre,
            likesCount: track.likes_count,
            commentsCount: track.comments_count,
            reportsCount: track.reports_count,
            price: parseFloat(track.price),
            createdBy: track.createdBy,
            status: track.status,
            isLike: track.isLike,
            isBuy: track.isBuy,
            creator: track.creator.full_name
          }))}
          title="Search Results"
          onPlayTrack={handlePlayTrack}
          setTracks={setTracks}
        />
      ) : searchTerm ? (
        <p>No results found for "{searchTerm}"</p>
      ) : null}
    </div>
  )
}

