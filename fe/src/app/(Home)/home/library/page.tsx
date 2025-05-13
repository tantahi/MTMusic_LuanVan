'use client'

import React, { useState, useEffect } from 'react'
import { Card, List, message, Typography, Space, Input, Empty, Spin, Tabs, Modal } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useAtomValue } from 'jotai'
import { tokenAtom, userAtom } from '@/lib/atom/user.atom'
import { usePlayerStore } from '@/hooks/usePlayer'
import axios from 'axios'
import SongList from '@/components/UserComponent/User/Library/SongList'
import PlaylistList from '@/components/UserComponent/User/Library/PlaylistList'

const { Title, Text } = Typography
const { TabPane } = Tabs

interface MediaType {
  id: number;
  name?: string | null;
  artist_name?: string | null;
  img_url?: string | null;
  audio_url?: string | null;
  description?: string | null;
  lyric?: string | null;
  duration?: string | null;
  media_type: 'Song' | 'Podcast';
  genre?: 'Pop' | 'Rap' | 'Jazz' | 'Classical' | null;
  likes_count?: number | null;
  comments_count?: number | null;
  reports_count?: number | null;
  createdBy?: number | null;
  deletedBy?: number | null;
  created_at: Date;
  updated_at: Date;
  status: 'Pending' | 'Rejected' | 'Violation';
  isLiked: boolean | null;
}

interface PlaylistType {
  id: number;
  name: string;
  genre?: 'Pop' | 'Rap' | 'Jazz' | 'Classical' | null;
  artist_name?: string | null;
  img_url?: string | null;
  user_id: number;
  type: 'Playlist' | 'Album' | 'Favourite';
  created_at: Date;
  items?: MediaType[];
}

export default function LibraryPage() {
  const [media, setMedia] = useState<MediaType[]>([])
  const [playlists, setPlaylists] = useState<PlaylistType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const token = useAtomValue(tokenAtom)
  const user = useAtomValue(userAtom)
  const router = useRouter()
  const { playTrack } = usePlayerStore()

  useEffect(() => {
    if (user && user.id) {
      fetchLibraryData()
    }
  }, [user])

  const fetchLibraryData = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/media/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setMedia(response.data.data.medias || []);
        setPlaylists(response.data.data.playlists || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch library data');
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch library data:', error);
      message.error('Failed to load your library');
      setLoading(false);
    }
  };

  const handlePlayTrack = (track: MediaType) => {
    if (track.audio_url) {
      const formattedTrack = {
        id: track.id,
        title: track.name || 'Untitled',
        artist: track.artist_name || 'Unknown Artist',
        cover: track.img_url ? `http://localhost:3001${track.img_url}` : '/placeholder.svg',
        src: `http://localhost:3001${track.audio_url}`,
      }
      playTrack(0, [formattedTrack])
    } else {
      message.error('This track cannot be played')
    }
  }

  const toggleLike = async (id: number) => {
    try {
      const response = await axios.post(`http://localhost:3001/media/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setMedia(prevMedia => 
          prevMedia.map(item => 
            item.id === id ? { ...item, isLiked: !item.isLiked, likes_count: (item.likes_count || 0) + (item.isLiked ? -1 : 1) } : item
          )
        )
      } else {
        throw new Error(response.data.message || 'Failed to update like status');
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      message.error('Failed to update like status');
    }
  }

  const handleCardClick = (id: number, type: string) => {
    router.push(`/home/${type.toLowerCase()}/${id}`)
  }

  const handleEditTrack = (id: number) => {
    router.push(`/home/library/media/${id}`)
  }

  const handleMoreOptions = (id: number) => {
    // Implement more options functionality
    console.log(`More options for track ${id}`)
  }

  const handleEditPlaylist = (id: number) => {
    // Implement edit playlist functionality
    console.log(`Edit playlist ${id}`)
  }

  const handleCreateSong = () => {
    router.push('/home/library/mediaAttachment')
  }

  const renderPlaylistList = (items: PlaylistType[]) => (
    <PlaylistList
      items={items}
      onEdit={handleEditPlaylist}
      onCreate={handleCreateSong}
    />
  )

  const renderAlbumList = (items: PlaylistType[], type: 'Album' | 'Favourite') => (
    <List
      grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 6 }}
      dataSource={items.filter(item => item.type === type)}
      renderItem={(item) => (
        <List.Item>
          <Card
            hoverable
            cover={<img alt={item.name} src={item.img_url ? `http://localhost:3001${item.img_url}` : '/placeholder.svg'} style={{ height: 200, objectFit: 'cover' }} />}
            onClick={() => handleCardClick(item.id, item.type)}
          >
            <Card.Meta
              title={item.name}
              description={
                <Space direction="vertical">
                  <Text>{item.artist_name || 'Various Artists'}</Text>
                  {item.genre && <Text type="secondary">{item.genre}</Text>}
                  <Text type="secondary">{item.items?.length || 0} tracks</Text>
                </Space>
              }
            />
          </Card>
        </List.Item>
      )}
    />
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    )
  }

  const filteredMedia = media.filter(item => 
    (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.artist_name?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false
  )

  const filteredPlaylists = playlists.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.artist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <Space direction="vertical" size="large" style={{ display: 'flex' }}>
        <div className="flex justify-between items-center">
          <Title level={2}>Your Library</Title>
        </div>
        <Input
          placeholder="Search your library"
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="large"
          style={{ maxWidth: 400 }}
        />
        <Tabs defaultActiveKey="1">
          <TabPane tab="Songs" key="1">
            <SongList 
              items={filteredMedia.filter(item => item.media_type === 'Song')}
              onEdit={handleEditTrack}
              onLike={toggleLike}
              onMoreOptions={handleMoreOptions}
            />
          </TabPane>
          <TabPane tab="Podcasts" key="2">
            <SongList 
              items={filteredMedia.filter(item => item.media_type === 'Podcast')}
              onEdit={handleEditTrack}
              onLike={toggleLike}
              onMoreOptions={handleMoreOptions}
            />
          </TabPane>
          {/* <TabPane tab="Playlists" key="3">
            {renderPlaylistList(filteredPlaylists.filter(item => item.type === 'Playlist'))}
          </TabPane>
          <TabPane tab="Albums" key="4">
            {renderAlbumList(filteredPlaylists, 'Album')}
          </TabPane> */}
        </Tabs>
      </Space>
    </div>
  )
}