'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Input, Button, Spin, Empty, Typography, message, Modal, List, Avatar } from 'antd'
import { SearchOutlined, PlusOutlined, PlayCircleOutlined } from '@ant-design/icons'
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
  description: string
  lyric: string
  media_type: string
  genre: string
  likes_count: number | null
  comments_count: number | null
  reports_count: number | null
  createdBy: number
  deletedBy: number | null
  created_at: string
  updated_at: string
  status: string
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

export default function Component({ params }: { params: { id: string } }) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Track[]>([])
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { updateQueue, currentTrack, isPlaying, isQueueInitialized, playTrack } = usePlayerStore()
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

  const handleSearch = async () => {
    if (searchQuery.trim() && token) {
      try {
        const results = await mediaService.search(searchQuery, token)
        setSearchResults(results)
        setIsSearchModalVisible(true)
      } catch (error) {
        console.error('Failed to search tracks:', error)
        message.error('Failed to search tracks')
      }
    }
  }

  const handleAddTrack = async (track: Track) => {
    if (playlist && token) {
      try {
        await mediaService.addToPlaylist(playlist.id, track.id, token)
        const updatedTracks = [...tracks, track]
        setTracks(updatedTracks)
        setPlaylist({
          ...playlist,
          song_count: playlist.song_count + 1
        })
        message.success(`Added "${track.name}" to the playlist`)

        if (isQueueInitialized && isPlaying && currentTrack && tracks.some(t => t.id === currentTrack.id)) {
          updateQueue(updatedTracks)
        }
      } catch (error) {
        console.error('Failed to add track to playlist:', error)
        message.error('Failed to add track to playlist')
      }
    }
  }

  const handlePlayTrack = (track: Track, index: number) => {
    const formattedTracks = tracks.map(t => ({
      id: t.id,
      title: t.name,
      artist: t.artist_name,
      cover: `http://localhost:3001${t.img_url}`,
      src: `http://localhost:3001${t.audio_url}`,
      duration: '', // You might want to add duration to your Track interface if available
    }))
    playTrack(index, formattedTracks)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!token) {
    return <div style={{ padding: '24px' }}>Please log in to view this playlist.</div>
  }

  if (!playlist) {
    return <div style={{ padding: '24px' }}>Playlist not found or you don't have permission to view it.</div>
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <img src={`http://localhost:3001${playlist.img_url}`} alt={playlist.name} style={{ width: '128px', height: '128px', objectFit: 'cover', borderRadius: '8px', marginRight: '24px' }} />
        <div>
          <Title level={2} style={{ marginBottom: '8px' }}>{playlist.name}</Title>
          <Text style={{ color: 'rgba(0, 0, 0, 0.45)', marginBottom: '8px', display: 'block' }}>{playlist.artist_name}</Text>
          <Text type="secondary">
            Genre: {playlist.genre} • Type: {playlist.type} • Tracks: {playlist.song_count}
          </Text>
        </div>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex' }}>
        <Input
          placeholder="Search for tracks to add"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ width: '300px' }}
          prefix={<SearchOutlined />}
        />
        <Button type="primary" onClick={handleSearch} icon={<PlusOutlined />} style={{ marginLeft: '8px' }}>
          Add Tracks
        </Button>
      </div>

      {tracks.length > 0 ? (
        <TrackList
          tracks={tracks.map(track => ({
            id: track.id,
            title: track.name,
            artist: track.artist_name,
            cover: `http://localhost:3001${track.img_url}`,
            src: `http://localhost:3001${track.audio_url}`,
            duration: '', // You might want to add duration to your Track interface if available
          }))}
          title="Playlist Tracks"
          onPlayTrack={handlePlayTrack}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              No tracks in this playlist yet. Use the search bar above to add tracks.
            </span>
          }
        />
      )}

      <Modal
        title="Search Results"
        visible={isSearchModalVisible}
        onCancel={() => setIsSearchModalVisible(false)}
        footer={null}
        width={800}
      >
        <List
          itemLayout="horizontal"
          dataSource={searchResults}
          renderItem={(track) => (
            <List.Item
              actions={[
                <Button key="play" icon={<PlayCircleOutlined />} onClick={() => handlePlayTrack(track, 0)} style={{ marginRight: '8px' }}>
                  Play
                </Button>,
                <Button key="add" icon={<PlusOutlined />} onClick={() => handleAddTrack(track)}>
                  Add
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={`http://localhost:3001${track.img_url}`} shape="square" size={64} />}
                title={<a href="#">{track.name}</a>}
                description={track.artist_name}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  )
}