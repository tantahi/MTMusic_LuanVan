'use client'

import React, { useState, FormEvent } from 'react'
import axios from 'axios'
import { Button, Card, message, Typography, Upload, Space, Spin } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
import TrackList from '@/components/TrackList'
import { usePlayerStore } from '@/hooks/usePlayer'
import { useAtomValue } from 'jotai'
import { userAtom } from '@/lib/atom/user.atom'

const { Title, Text } = Typography

interface ApiTrack {
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
  similarityScore: number
  isLike: boolean
  isBuy: boolean
}

export default function MelodySearchPage() {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [tracks, setTracks] = useState<ApiTrack[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { playTrack } = usePlayerStore()
  const user = useAtomValue(userAtom)

  const handleFileChange: UploadProps['onChange'] = (info) => {
    setFileList(info.fileList.slice(-1))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (fileList.length === 0 || !fileList[0].originFileObj) {
      message.error('Please select an audio file')
      return
    }

    setIsLoading(true)

    const formData = new FormData()
    formData.append('img_url', fileList[0].originFileObj)
    formData.append('userId', user.id.toString())

    try {
      const response = await axios.post<{ success: boolean, message: string, data: ApiTrack[] }>(`http://localhost:3001/media/search-by-melody?userId=${user.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      if (response.data.success) {
        setTracks(response.data.data)
        message.success('Search completed successfully')
      } else {
        throw new Error(response.data.message)
      }
    } catch (err) {
      message.error('An error occurred while searching. Please try again.')
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlayTrack = (track: ApiTrack, index: number) => {
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
      similarityScore: t.similarityScore,
    }))
    playTrack(index, formattedTracks)
  }

  return (
    <div className='w-full' style={{ margin: '0 auto', padding: '24px' }}>
      <Card>
        <Title level={2}>Melody Search</Title>
        <Text type="secondary">Upload a file to find similar songs</Text>
        <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Upload
              accept="audio/*"
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Select Audio File</Button>
            </Upload>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              style={{ width: '100%' }}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </Space>
        </form>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Spin size="large" />
          </div>
        ) : tracks.length > 0 && (
          <div style={{ marginTop: '24px' }}>
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
                similarityScore: track.similarityScore
              }))}
              title="Search Results"
              onPlayTrack={handlePlayTrack}
              setTracks={setTracks}
              onFavoriteToggle={() => {
                // Implement favorite toggle logic if needed
                console.log('Favorite toggled')
              }}
            />
          </div>
        )}
      </Card>
    </div>
  )
}

