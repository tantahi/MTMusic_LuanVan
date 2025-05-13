'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Spin, Typography, List, Avatar } from 'antd'
import { PlayCircleOutlined } from '@ant-design/icons'
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

export default function ViewOnlyPlaylistDetail({ params }: { params: { id: string } }) {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    )
  }

  if (!token) {
    return <div className="p-6">Please log in to view this playlist.</div>
  }

  if (!playlist) {
    return <div className="p-6">Playlist not found or you don't have permission to view it.</div>
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <img 
          src={`http://localhost:3001${playlist.img_url}`} 
          alt={playlist.name} 
          className="w-32 h-32 object-cover rounded-lg mr-6" 
        />
        <div>
          <Title level={2} className="mb-2">{playlist.name}</Title>
          <Text className="text-gray-500 mb-2 block">{playlist.artist_name}</Text>
          <Text type="secondary">
            Genre: {playlist.genre} • Type: {playlist.type} • Tracks: {playlist.song_count}
          </Text>
        </div>
      </div>

      <List
        itemLayout="horizontal"
        dataSource={tracks}
        renderItem={(track, index) => (
          <List.Item
            actions={[
              <PlayCircleOutlined 
                key="play" 
                onClick={() => handlePlayTrack(track, index)} 
                className="text-2xl cursor-pointer hover:text-blue-500"
              />
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={`http://localhost:3001${track.img_url}`} shape="square" size={64} />}
              title={<a href="#" onClick={(e) => { e.preventDefault(); handlePlayTrack(track, index); }}>{track.name}</a>}
              description={track.artist_name}
            />
          </List.Item>
        )}
      />
    </div>
  )
}

