'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Spin, Empty, message } from 'antd'
import axios from 'axios'
import TrackList from '@/components/TrackList'
import { usePlayerStore } from '@/hooks/usePlayer'
import { useAtomValue } from 'jotai'
import { tokenAtom } from '@/lib/atom/user.atom'

interface PurchasedTrack {
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
  approvedBy: number
  created_at: string
  updated_at: string
  status: string
  isLike: boolean
  isBuy: boolean
  purchaseDate: string
}

interface ApiResponse {
  success: boolean
  message: string
  data: PurchasedTrack[]
}

export default function PurchasedSongsList() {
  const [purchasedTracks, setPurchasedTracks] = useState<PurchasedTrack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { playTrack } = usePlayerStore()
  const token = useAtomValue(tokenAtom)

  const loadPurchasedSongs = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const response = await axios.get<ApiResponse>('http://localhost:3001/media/purchase-song', {
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
      message.error('Failed to load purchased songs')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadPurchasedSongs()
  }, [loadPurchasedSongs])

  const handlePlayTrack = (track: PurchasedTrack, index: number) => {
    const formattedTracks = purchasedTracks.map(t => ({
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
      purchaseDate: t.purchaseDate,
    }))
    playTrack(index, formattedTracks)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    )
  }

  if (!token) {
    return <div className="p-6">Please log in to view your purchased songs.</div>
  }

  if (purchasedTracks.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Your Purchased Medias</h1>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              You haven't purchased any songs yet. Start shopping!
            </span>
          }
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      <TrackList
        tracks={purchasedTracks.map(track => ({
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
          createdBy: track.createdBy,
          deletedBy: track.deletedBy,
          approvedBy: track.approvedBy,
          createdAt: track.created_at,
          updatedAt: track.updated_at,
          status: track.status,
          isLike: track.isLike,
          isBuy: track.isBuy,
          purchaseDate: track.purchaseDate
        }))}
        title="Purchased Medias"
        onPlayTrack={handlePlayTrack}
        setTracks={setPurchasedTracks}
        onFavoriteToggle={loadPurchasedSongs}
      />
    </div>
  )
}