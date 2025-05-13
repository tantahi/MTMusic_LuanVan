'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Card, Avatar, Input, Button, List, Typography, Space, Layout, Tag, Statistic, Spin, message } from 'antd'
import { UserOutlined, SendOutlined, HeartOutlined, HeartFilled, CommentOutlined, FlagOutlined, DollarOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import mediaService from '@/services/media.service'
import commentService from '@/services/comment.service'
import { userAtom, tokenAtom } from '@/lib/atom/user.atom'
import { useAtomValue } from 'jotai'
import ReportModal from '@/components/UserComponent/ReportModal'
import PurchaseButton from '@/components/UserComponent/PurchaseModal'

const { TextArea } = Input
const { Title, Text, Paragraph } = Typography
const { Content } = Layout

interface MediaType {
  id: number
  name: string
  artist_name: string
  img_url: string
  audio_url: string
  duration: string
  description: string
  lyric: string
  media_type: 'Song' | 'Podcast'
  genre: string
  price: string
  isBuy: boolean
  likes_count: number
  comments_count: number
  reports_count: number
  createdBy: number
  deletedBy: number | null
  created_at: string
  updated_at: string
  status: 'Pending' | 'Rejected' | 'Violation'
  isLike: boolean
}

interface CommentType {
  id: number
  content: string
  cusor: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  user_id: number
  media_id: number
  parent_comment_id: number | null
  User: {
    id: number
    full_name: string
    img_url: string
  }
}

export default function SongDetailPage() {
  const params = useParams()
  const id = Number(params.id)
  const user = useAtomValue(userAtom)
  const token = useAtomValue(tokenAtom)

  const [song, setSong] = useState<MediaType | null>(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<CommentType[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [isReportModalVisible, setIsReportModalVisible] = useState(false)

  const fetchSongDetails = useCallback(async () => {
    if (!token) return
    try {
      if (isNaN(id)) {
        throw new Error('Invalid song ID')
      }
      const response = await mediaService.getMediaDetail(id, user?.id)
      if (response.success) {
        setSong(response.data)
      } else {
        throw new Error(response.message || 'Failed to load song details')
      }
      setLoading(false)
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message || 'Failed to load song details. Please try again later.')
      } else {
        message.error('An unexpected error occurred. Please try again later.')
      }
      setLoading(false)
    }
  }, [id, user?.id, token])

  const fetchComments = useCallback(async () => {
    if (!token) return
    try {
      const response = await commentService.getCommentById(id)
      if (response.success && response.status === 200) {
        setComments(response.comments)
      } else {
        throw new Error('Failed to fetch comments')
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      message.error('Failed to load comments. Please try again later.')
    }
  }, [id, token])

  useEffect(() => {
    if (token) {
      fetchSongDetails()
    }
  }, [fetchSongDetails, token])

  useEffect(() => {
    if (!loading && token) {
      fetchComments()
    }
  }, [fetchComments, loading, token])

  const handleCommentSubmit = async () => {
    if (newComment.trim() && user && token) {
      setCommentLoading(true)
      try {
        const commentData = {
          content: newComment,
          media_id: id,
          user_id: user.id
        }
        const response = await commentService.createComment(commentData, token)
        if (response.success) {
          const newCommentObj: CommentType = {
            id: response.comment.id,
            content: newComment,
            cusor: response.comment.cusor,
            created_at: response.comment.created_at,
            updated_at: response.comment.updated_at,
            deleted_at: null,
            user_id: user.id,
            media_id: id,
            parent_comment_id: null,
            User: {
              id: user.id,
              full_name: user.full_name,
              img_url: user.img_url || '/placeholder.svg?height=40&width=40'
            }
          }
          setComments(prevComments => [...prevComments, newCommentObj])
          setSong(prevSong => prevSong ? { ...prevSong, comments_count: prevSong.comments_count + 1 } : null)
          setNewComment('')
          message.success('Comment posted successfully')
        } else {
          throw new Error('Failed to post comment')
        }
      } catch (error) {
        console.error('Failed to post comment:', error)
        message.error('Failed to post comment. Please try again.')
      } finally {
        setCommentLoading(false)
      }
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!token) return
    try {
      const response = await commentService.deleteComment(commentId, token)
      if (response.success) {
        setComments(prevComments => prevComments.filter(comment => comment.id !== commentId))
        setSong(prevSong => prevSong ? { ...prevSong, comments_count: prevSong.comments_count - 1 } : null)
        message.success('Comment deleted successfully')
      } else {
        throw new Error('Failed to delete comment')
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
      message.error('Failed to delete comment. Please try again.')
    }
  }

  const handleLikeUnlike = async () => {
    if (song && !likeLoading && token) {
      setLikeLoading(true)
      try {
        let response
        if (song.isLike) {
          response = await mediaService.deleteFavourite(song.id, token)
        } else {
          response = await mediaService.addToFavourite(song.id, token)
        }
        if (response.success) {
          setSong(prevSong => ({
            ...prevSong!,
            isLike: !prevSong!.isLike,
            likes_count: prevSong!.likes_count + (prevSong!.isLike ? -1 : 1)
          }))
          message.success(song.isLike ? 'Song removed from favorites' : 'Song added to favorites')
        } else {
          throw new Error('Failed to update favorite status')
        }
      } catch (error) {
        console.error('Failed to update favorite status:', error)
        message.error('Failed to update favorite status. Please try again.')
      } finally {
        setLikeLoading(false)
      }
    }
  }

  const showReportModal = () => setIsReportModalVisible(true)
  const handleReportModalClose = () => setIsReportModalVisible(false)

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!song) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Title level={3}>Song not found</Title>
      </div>
    )
  }

  return (
    <Layout>
      <Content className='w-full' style={{ padding: '24px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <Space align="start" size="large">
              <img
                src={'http://localhost:3001'+song.img_url || "/placeholder.svg?height=300&width=300"}
                alt="Album cover"
                style={{ width: '300px', height: '300px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <Space direction="vertical" size="middle" style={{ flex: 1 }}>
                <Title level={2} style={{ margin: 0 }}>{song.name}</Title>
                <Text type="secondary" style={{ fontSize: '18px' }}>{song.artist_name}</Text>
                {song.genre && <Tag color="green">{song.genre}</Tag>}
                <Paragraph>{song.description}</Paragraph>
                <Space>
                  <Statistic title="Duration" value={song.duration} />
                  <Statistic 
                    title="Likes" 
                    value={song.likes_count} 
                    prefix={song.isLike ? <HeartFilled /> : <HeartOutlined />} 
                  />
                  <Statistic 
                    title="Comments" 
                    value={song.comments_count} 
                    prefix={<CommentOutlined />} 
                  />
                  <Statistic
                    title="Price"
                    value={(parseFloat(song.price) / 100).toFixed(2)}
                    prefix={<DollarOutlined />}
                  />
                </Space>
                <Space>
                  <Button 
                    type={song.isLike ? "primary" : "default"} 
                    icon={song.isLike ? <HeartFilled /> : <HeartOutlined />} 
                    onClick={handleLikeUnlike}
                    loading={likeLoading}
                    disabled={!token}
                  >
                    {song.isLike ? "Unlike" : "Like"}
                  </Button>
                  <Button 
                    type="default"
                    icon={<FlagOutlined />}
                    onClick={showReportModal}
                    disabled={!token}
                  >
                    Report
                  </Button>
                  {(!song.isBuy&&song.price!='0.00') && (
                    <PurchaseButton
                      price={parseFloat(song.price) / 100}
                      itemId={song.id.toString()}
                      itemType="Song"
                    />
                  )}
                  {song.isBuy && (
                    <Tag color="blue" icon={<ShoppingCartOutlined />}>Purchased</Tag>
                  )}
                </Space>
              </Space>
            </Space>
            <Card style={{ marginTop: '24px' }} bodyStyle={{ maxHeight: '300px', overflow: 'auto' }}>
              <Title level={3}>Lyrics</Title>
              <Paragraph style={{ whiteSpace: 'pre-line' }}>
                {song.lyric}
              </Paragraph>
            </Card>
          </Card>

          <Card title={<Title level={3}>Comments ({song.comments_count})</Title>}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Space.Compact style={{ width: '100%' }}>
                <TextArea
                  rows={4}
                  placeholder="Write your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button 
                  type="primary" 
                  icon={<SendOutlined />} 
                  onClick={handleCommentSubmit}
                  loading={commentLoading}
                  disabled={!user || !token}
                >
                  Send
                </Button>
              </Space.Compact>

              <List
                itemLayout="horizontal"
                dataSource={comments}
                renderItem={(comment) => (
                  <List.Item
                    actions={[
                      user && user.id === comment.user_id && (
                        <Button type="link" onClick={() => handleDeleteComment(comment.id)}>Delete</Button>
                      )
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={comment.User.img_url} icon={<UserOutlined />} />}
                      title={comment.User.full_name}
                      description={
                        <>
                          <div>{comment.content}</div>
                          <Text type="secondary">{new Date(comment.created_at).toLocaleString()}</Text>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Space>
          </Card>
        </Space>
      </Content>
      <ReportModal
        visible={isReportModalVisible}
        onClose={handleReportModalClose}
        postId={song.id}
        userId={user?.id}
      />
    </Layout>
  )
}

