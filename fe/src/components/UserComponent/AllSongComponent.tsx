'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Spin, Empty, message, Tabs } from 'antd'
import axios from 'axios'
import TrackList from '@/components/TrackList'
import { usePlayerStore } from '@/hooks/usePlayer'
import { useAtomValue } from 'jotai'
import { tokenAtom, userAtom } from '@/lib/atom/user.atom'

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
  audio_vector: number[]
  price: string
  createdBy: number
  deletedBy: number | null
  approvedBy: number | null
  created_at: string
  updated_at: string
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

interface ApiResponse {
  success: boolean
  message: string
  data: Track[]
}

const { TabPane } = Tabs

export default function AllSongComponent() {
  const [allTracks, setAllTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeGenre, setActiveGenre] = useState<string>('All')
  const { playTrack } = usePlayerStore()
  const token = useAtomValue(tokenAtom)
  const user = useAtomValue(userAtom)

  const loadAllSongs = useCallback(async () => {
    if (!token || !user) return
    setIsLoading(true)
    try {
      const response = await axios.get<ApiResponse>(`http://localhost:3001/media/user?userId=${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (response.data.success) {
        setAllTracks(response.data.data.filter(track => track.media_type === "Song"))
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      console.error('Failed to load songs:', error)
      message.error('Failed to load songs')
    } finally {
      setIsLoading(false)
    }
  }, [token, user])

  useEffect(() => {
    loadAllSongs()
  }, [loadAllSongs])

  const handlePlayTrack = (track: Track, index: number) => {
    const formattedTracks = allTracks.map(t => ({
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
      audioVector: t.audio_vector,
      price: t.price,
      createdBy: t.createdBy,
      deletedBy: t.deletedBy,
      approvedBy: t.approvedBy,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      status: t.status,
      isLike: t.isLike,
      isBuy: t.isBuy,
      creator: t.creator.full_name
    }))
    playTrack(index, formattedTracks)
  }

  const filteredTracks = activeGenre === 'All' 
    ? allTracks 
    : allTracks.filter(track => track.genre === activeGenre)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    )
  }

  if (!token || !user) {
    return <div className="p-6">Please log in to view all songs.</div>
  }

  if (allTracks.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">All Songs</h1>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              No songs available at the moment.
            </span>
          }
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      <Tabs defaultActiveKey="All" onChange={setActiveGenre}>
        <TabPane tab="All" key="All" />
        <TabPane tab="Pop" key="Pop" />
        <TabPane tab="Rap" key="Rap" />
        <TabPane tab="Jazz" key="Jazz" />
        <TabPane tab="Classical" key="Classical" />
      </Tabs>
      <TrackList
        tracks={filteredTracks.map(track => ({
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
          audioVector: track.audio_vector,
          price: track.price,
          createdBy: track.creator.id,
          deletedBy: track.deletedBy,
          approvedBy: track.approvedBy,
          createdAt: track.created_at,
          updatedAt: track.updated_at,
          status: track.status,
          isLike: track.isLike,
          isBuy: track.isBuy,
          creator: track.creator.full_name
        }))}
        title={`${activeGenre === 'All' ? 'All' : activeGenre} Songs`}
        onPlayTrack={handlePlayTrack}
        setTracks={setAllTracks}
        onFavoriteToggle={loadAllSongs}
      />
    </div>
  )
}

