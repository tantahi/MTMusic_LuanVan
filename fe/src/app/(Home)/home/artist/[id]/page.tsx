'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAtomValue } from 'jotai'
import axios from 'axios'
import { Button, Avatar, Typography, Space, Tabs, message, Card, Grid, Spin } from 'antd'
import { UserAddOutlined, MessageOutlined } from '@ant-design/icons'

import { userAtom, tokenAtom } from '@/lib/atom/user.atom'
import AlbumSection from '@/components/AlbumSection'
import TrackList from '@/components/TrackList'
import { usePlayerStore } from '@/hooks/usePlayer'

const { Title, Text } = Typography
const { TabPane } = Tabs
const { useBreakpoint } = Grid

const API_BASE_URL = 'http://localhost:3001'

interface UserProfile {
  user: {
    id: number
    full_name: string
    img_url: string
  }
  followersCount: number
  followingsCount: number
  songsCount: number
  isFollowing: boolean
}

interface Track {
  id: number
  name: string
  artist_name: string
  duration: string
  audio_url: string
  img_url: string
  isLike: boolean
  createdBy: number
}

export default function ArtistPage() {
  const router = useRouter()
  const params = useParams()
  const following_id = params.id as string

  const token = useAtomValue(tokenAtom)
  const user = useAtomValue(userAtom)
  const [isFollowing, setIsFollowing] = useState(false)
  const [profileData, setProfileData] = useState<UserProfile | null>(null)
  const [songs, setSongs] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const screens = useBreakpoint()
  const { playTrack } = usePlayerStore()

  const fetchProfileData = useCallback(async () => {
    if (!user || !token) return

    try {
      const response = await axios.get<{ userProfile: UserProfile }>(`${API_BASE_URL}/following/profile/${following_id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { id: user.id }
      })
      setProfileData(response.data.userProfile)
      setIsFollowing(response.data.userProfile.isFollowing)
    } catch (error) {
      console.error('Error fetching profile data:', error)
      message.error('Failed to load artist profile. Please try again later.')
    }
  }, [following_id, user, token])

  const fetchUserContent = useCallback(async () => {
    if (!token) return

    try {
      const response = await axios.get<{ data: { songs: Track[] } }>(`${API_BASE_URL}/media/user-content/${following_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSongs(response.data.data.songs)
    } catch (error) {
      console.error('Error fetching user content:', error)
      message.error('Failed to load user content. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }, [following_id, token])

  useEffect(() => {
    if (user && token) {
      fetchProfileData()
      fetchUserContent()
    }
  }, [fetchProfileData, fetchUserContent, user, token])

  const handleFollowToggle = async () => {
    if (!user) {
      message.error('You must be logged in to follow or unfollow an artist.')
      return
    }

    try {
      if (isFollowing) {
        await axios.put(`${API_BASE_URL}/following/unfollow`, { follower_id: user.id, following_id }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post(`${API_BASE_URL}/following/follow`, { follower_id: user.id, following_id }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setIsFollowing(!isFollowing)
      if (profileData) {
        setProfileData({
          ...profileData,
          followersCount: isFollowing ? profileData.followersCount - 1 : profileData.followersCount + 1
        })
      }
      message.success(isFollowing ? 'Unfollowed successfully' : 'Followed successfully')
    } catch (error) {
      console.error('Error toggling follow status:', error)
      message.error('Failed to update follow status. Please try again.')
    }
  }

  const handleChatClick = () => {
    router.push(`/home/chat/${following_id}`)
  }

  const handlePlayTrack = (track: Track, index: number) => {
    const formattedTracks = songs.map(t => ({
      id: t.id,
      title: t.name,
      artist: t.artist_name,
      cover: `${API_BASE_URL}${t.img_url}`,
      src: `${API_BASE_URL}${t.audio_url}`,
      duration: t.duration,
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

  if (!profileData) {
    return <div className="min-h-screen flex items-center justify-center">Failed to load artist profile. Please try again later.</div>
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 text-black dark:text-white">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <Space size={24} align="start">
            <Avatar
              size={screens.md ? 144 : 96}
              src={`${API_BASE_URL}${profileData.user.img_url}` || "/placeholder.svg?height=144&width=144"}
              alt={profileData.user.full_name}
            />
            <div>
              <Title level={screens.md ? 1 : 2}>{profileData.user.full_name}</Title>
              <Space className="mt-4">
                <Button
                  icon={<UserAddOutlined />}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
                <Button icon={<MessageOutlined />} onClick={handleChatClick}>
                  Chat
                </Button>
              </Space>
              <div className="mt-2">
                <Text type="secondary">{profileData.followersCount} followers</Text>
                <Text type="secondary" className="ml-4">{profileData.followingsCount} following</Text>
                <Text type="secondary" className="ml-4">{profileData.songsCount} songs</Text>
              </div>
            </div>
          </Space>
        </Card>

        <Tabs defaultActiveKey="songs" className="mt-6">
          <TabPane tab="Songs" key="songs">
            <TrackList
              tracks={songs.map(track => ({
                id: track.id,
                title: track.name,
                artist: track.artist_name,
                cover: `${API_BASE_URL}${track.img_url}`,
                audio: `${API_BASE_URL}${track.audio_url}`,
                createdBy: track.createdBy,
                isLike: track.isLike,
                duration: track.duration,
              }))}
              title="User Tracks"
              onPlayTrack={handlePlayTrack}
              setTracks={setSongs}
              onFavoriteToggle={fetchUserContent}
            />
          </TabPane>
          {/* <TabPane tab="Albums" key="albums">
            <AlbumSection />
          </TabPane> */}
          <TabPane tab="Podcast" key="podcast">
            <div className="text-center py-8">
              <Text type="secondary">Podcast section is under development</Text>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  )
}

