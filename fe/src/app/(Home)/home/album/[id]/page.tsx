'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button, Spin, Typography, message } from 'antd'
import { PlayCircleOutlined, PlusOutlined } from '@ant-design/icons'
import TrackList from '@/components/TrackList'
import { usePlayerStore } from '@/hooks/usePlayer'
import mediaService from '@/services/media.service'
import { useAtomValue } from 'jotai'
import { tokenAtom } from '@/lib/atom/user.atom'

const { Text, Title } = Typography

interface Track {
  id: number
  name: string
  artist_name: string
  img_url: string
  audio_url: string
}

interface Playlist {
  id: number
  name: string
  genre: string
  artist_name: string
  img_url: string
  type: string
  song_count: number
}

interface PlaylistResponse {
  success: boolean
  message: string
  data: {
    playlist: Playlist
    medias: Track[]
  }
}

export default function PlaylistDetail({ params }: { params: { id: string } }) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { playTrack } = usePlayerStore()
  const token = useAtomValue(tokenAtom)

  const loadPlaylist = useCallback(async () => {
    if (!token) return
    
    try {
      const response: PlaylistResponse = await mediaService.getMediaByPlaylist(parseInt(params.id), token)
      if (response.success) {
        setPlaylist(response.data.playlist)
        setTracks(response.data.medias)
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Failed to load playlist:', error)
      message.error('Failed to load playlist')
    } finally {
      setIsLoading(false)
    }
  }, [params.id, token])

  useEffect(() => {
    if (token) {
      loadPlaylist()
    } else {
      setIsLoading(false)
    }
  }, [token, loadPlaylist])

  const handlePlayTrack = (track: Track, index: number) => {
    const formattedTracks = tracks.map(t => ({
      id: t.id,
      title: t.name,
      artist: t.artist_name,
      cover: `http://localhost:3001${t.img_url}`,
      src: `http://localhost:3001${t.audio_url}`,
      duration: '',
    }))
    playTrack(index, formattedTracks)
  }

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      handlePlayTrack(tracks[0], 0)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    )
  }

  if (!token) {
    return <div className="p-6 text-center text-xl font-semibold">Please log in to view this playlist.</div>
  }

  if (!playlist) {
    return <div className="p-6 text-center text-xl font-semibold">Playlist not found or you don't have permission to view it.</div>
  }

  return (
    <div className="p-6 bg-gradient-to-b from-gray-900 to-black text-white min-h-screen">
      <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-6 mb-8">
        <img 
          src={`http://localhost:3001${playlist.img_url}`} 
          alt={playlist.name} 
          className="w-64 h-64 object-cover rounded-lg shadow-2xl" 
        />
        <div className="text-center md:text-left">
          <Text className="text-sm font-medium uppercase tracking-wider text-gray-400">{playlist.type}</Text>
          <Title level={1} className="text-4xl md:text-6xl font-bold mb-2 text-white">{playlist.name}</Title>
          <Text className="text-xl text-gray-300 mb-4 block">{playlist.artist_name}</Text>
          <Text className="text-sm text-gray-400">
            {playlist.genre} • {playlist.song_count} {playlist.song_count === 1 ? 'song' : 'songs'}
          </Text>
        </div>
      </div>

      <div className="mb-8 flex space-x-4">
        <Button 
          type="primary" 
          icon={<PlayCircleOutlined />} 
          size="large"
          onClick={handlePlayAll}
          className="bg-green-500 hover:bg-green-600 border-none rounded-full px-8 py-3 text-lg font-semibold"
        >
          Play
        </Button>
      </div>

      <TrackList
        tracks={tracks.map(track => ({
          id: track.id,
          title: track.name,
          artist: track.artist_name,
          cover: `http://localhost:3001${track.img_url}`,
          src: `http://localhost:3001${track.audio_url}`,
          duration: '',
        }))}
        onPlayTrack={handlePlayTrack}
      />
    </div>
  )
}

