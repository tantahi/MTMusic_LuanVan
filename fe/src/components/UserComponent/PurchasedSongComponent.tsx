'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Spin, Empty, message } from 'antd'
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

const PurchasedSongs: React.FC = () => {
  const [purchasedTracks, setPurchasedTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { playTrack } = usePlayerStore()
  const token = useAtomValue(tokenAtom)
  const user = useAtomValue(userAtom)

  const loadPurchasedSongs = useCallback(async () => {
    if (!token || !user) return
    setIsLoading(true)
    try {
      const response = await axios.get<ApiResponse>('http://localhost:3001/media/purchased/song', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (response.data.success) {
        setPurchasedTracks(response.data.data)
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      console.error('Failed to load purchased songs:', error)
      message.error('Failed to load purchased tracks')
    } finally {
      setIsLoading(false)
    }
  }, [token, user])

  useEffect(() => {
    loadPurchasedSongs()
  }, [loadPurchasedSongs])

  const handlePlayTrack = (track: Track, index: number) => {
    const formattedTracks = purchasedTracks.map(t => ({
      id: t.id,
      title: t.name,
      artist: t.artist_name,
      creator: t.creator.full_name,
      cover: `http://localhost:3001${t.img_url}`,
      audio: `http://localhost:3001${t.audio_url}`,
      duration: t.duration,
      createdBy: t.creator.id,
      isLike: t.isLike,
      isBuy: t.isBuy,
      price: parseFloat(t.price)
    }))
    playTrack(index, formattedTracks)
  }

  const handleFavoriteToggle = async (trackId: number, isFavorite: boolean) => {
    // Implement favorite toggle logic here
    // After successful toggle, update the track in purchasedTracks
    setPurchasedTracks(prevTracks => 
      prevTracks.map(track => 
        track.id === trackId ? { ...track, isLike: isFavorite } : track
      )
    )
  }

  if (!token || !user) {
    return <div className="p-6">Please log in to view purchased tracks.</div>
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Purchased Tracks</h1>
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spin size="large" />
        </div>
      ) : purchasedTracks.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              You haven't purchased any tracks yet.
            </span>
          }
        />
      ) : (
        <TrackList
          tracks={purchasedTracks.map(track => ({
            id: track.id,
            title: track.name,
            artist: track.artist_name,
            creator: track.creator.full_name,
            cover: `http://localhost:3001${track.img_url}`,
            audio: `http://localhost:3001${track.audio_url}`,
            duration: track.duration,
            createdBy: track.creator.id,
            isLike: track.isLike,
            isBuy: track.isBuy,
            price: parseFloat(track.price)
          }))}
          title="Purchased Tracks"
          setTracks={(updatedTracks) => {
            const updatedPurchasedTracks = purchasedTracks.map(track => {
              const updatedTrack = updatedTracks.find(t => t.id === track.id)
              return updatedTrack ? { ...track, ...updatedTrack } : track
            })
            setPurchasedTracks(updatedPurchasedTracks)
          }}
          onFavoriteToggle={handleFavoriteToggle}
          onPlayTrack={handlePlayTrack}
        />
      )}
    </div>
  )
}

export default PurchasedSongs

