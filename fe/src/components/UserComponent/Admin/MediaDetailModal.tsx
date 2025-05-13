'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Modal, Tabs, Card, Avatar, List, Tag, Typography, Space, Button, Alert } from 'antd'
import { UserOutlined, LikeOutlined, CommentOutlined, FlagOutlined, DeleteOutlined } from '@ant-design/icons'
import { userAtom, tokenAtom } from '@/lib/atom/user.atom'
import { useAtomValue } from 'jotai'

const { TabPane } = Tabs
const { Meta } = Card
const { Title, Text, Paragraph } = Typography

type MediaDetails = {
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
  creator: {
    id: number
    email: string
    password: string
    full_name: string
    img_url: string | null
    birthday: string | null
    address: string | null
    role: string
    paypalAccountId: string | null
    paypalEmail: string | null
    status: string
    created_at: string
    updated_at: string
    vip_start_date: string
    vip_end_date: string
    deleted_at: string | null
    report_count: number | null
    deletedAt: string | null
  }
  comments: {
    id: number
    content: string
    created_at: string
    updated_at: string
    User: {
      id: number
      full_name: string
      email: string
      img_url: string | null
    }
  }[]
  reports: {
    id: number
    report_type: string
    description: string
    status: string
    created_at: string
    User: {
      id: number
      full_name: string
      email: string
    }
  }[]
}

interface MediaDetailsModalProps {
  id: number
}

export default function MediaDetailsModal({ id }: MediaDetailsModalProps) {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [mediaDetails, setMediaDetails] = useState<MediaDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userId = useAtomValue(userAtom)?.id
  const token = useAtomValue(tokenAtom)

  useEffect(() => {
    const fetchMediaDetails = async () => {
      if (!isModalVisible) return
      setLoading(true)
      setError(null)
      try {
        const response = await axios.get(`http://localhost:3001/media/${id}?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setMediaDetails(response.data.data)
      } catch (err) {
        console.error('Error fetching media details:', err)
        setError('Failed to load media details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchMediaDetails()
  }, [id, userId, token, isModalVisible])

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const handleDeleteComment = async (commentId: number) => {
    // Implement the actual delete logic here
    console.log(`Delete comment with id: ${commentId}`)
    // After successful deletion, you might want to refetch the media details
  }

  const formatPrice = (priceInCents: string) => {
    const priceInDollars = parseInt(priceInCents) / 100
    return priceInDollars.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div style={{ position: 'relative', zIndex: 1000 }}>
      <Button onClick={showModal}>View</Button>
      <Modal
        className="fixed inset-0 z-50 overflow-auto"
        title={mediaDetails?.name || 'Media Details'}
        visible={isModalVisible}
        onCancel={handleCancel}
        width={1000}
        footer={null}
        bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
      >
        {mediaDetails && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Details" key="1">
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {mediaDetails.status === 'Rejected' && (
                  <Alert
                    message="Rejection Reason"
                    description={mediaDetails.description?.split('Rejection reason:')[1] || 'No reason provided'}
                    type="error"
                    showIcon
                  />
                )}
                <Card
                  cover={
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
                      <img
                        alt={mediaDetails.name}
                        src={`http://localhost:3001${mediaDetails.img_url}`}
                        style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                      />
                    </div>
                  }
                  actions={[
                    <span key="likes"><LikeOutlined /> {mediaDetails.likes_count}</span>,
                    <span key="comments"><CommentOutlined /> {mediaDetails.comments_count}</span>,
                    <span key="reports"><FlagOutlined /> {mediaDetails.reports_count}</span>,
                  ]}
                >
                  <Meta
                    title={mediaDetails.name}
                    description={
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Paragraph>
                            <Text strong>Artist:</Text> {mediaDetails.artist_name}
                          </Paragraph>
                          <Paragraph>
                            <Text strong>Duration:</Text> {mediaDetails.duration}
                          </Paragraph>
                          <Paragraph>
                            <Text strong>Type:</Text> {mediaDetails.media_type}
                          </Paragraph>
                          <Paragraph>
                            <Text strong>Genre:</Text> {mediaDetails.genre}
                          </Paragraph>
                        </div>
                        <div>
                          <Paragraph>
                            <Text strong>Price:</Text> {formatPrice(mediaDetails.price)}
                          </Paragraph>
                          <Paragraph>
                            <Text strong>Status:</Text> <Tag color={mediaDetails.status === 'Rejected' ? 'red' : 'green'}>{mediaDetails.status}</Tag>
                          </Paragraph>
                          <Paragraph>
                            <Text strong>Created:</Text> {new Date(mediaDetails.created_at).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </Paragraph>
                          <Paragraph>
                            <Text strong>Updated:</Text> {new Date(mediaDetails.updated_at).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </Paragraph>
                        </div>
                      </div>
                    }
                  />
                </Card>
                <Card title="Description">
                  <Paragraph>{mediaDetails.description?.split('Rejection reason:')[0]}</Paragraph>
                </Card>
                <Card title="Lyrics">
                  <Paragraph>{mediaDetails.lyric}</Paragraph>
                </Card>
                <Card title="Audio">
                  <audio controls src={`http://localhost:3001${mediaDetails.audio_url}`} style={{ width: '100%' }}>
                    Your browser does not support the audio element.
                  </audio>
                </Card>
              </Space>
            </TabPane>
            <TabPane tab="Creator" key="2">
              <Card>
                <Meta
                  avatar={
                    <Avatar
                      size={64}
                      icon={<UserOutlined />}
                      src={mediaDetails.creator.img_url ? `http://localhost:3001${mediaDetails.creator.img_url}` : undefined}
                      style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                    />
                  }
                  title={mediaDetails.creator.full_name}
                  description={
                    <>
                      <Paragraph>
                        <Text strong>Email:</Text> {mediaDetails.creator.email}
                      </Paragraph>
                      <Paragraph>
                        <Text strong>Role:</Text> {mediaDetails.creator.role}
                      </Paragraph>
                      <Paragraph>
                        <Text strong>Status:</Text> {mediaDetails.creator.status}
                      </Paragraph>
                      <Paragraph>
                        <Text strong>VIP Period:</Text> {new Date(mediaDetails.creator.vip_start_date).toLocaleDateString()} - {new Date(mediaDetails.creator.vip_end_date).toLocaleDateString()}
                      </Paragraph>
                    </>
                  }
                />
              </Card>
            </TabPane>
            <TabPane tab="Comments" key="3">
              <List
                itemLayout="horizontal"
                dataSource={mediaDetails.comments}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button
                        key={item.id}
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDeleteComment(item.id)}
                      >
                        Delete
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={<UserOutlined />}
                          src={item.User.img_url ? `http://localhost:3001${item.User.img_url}` : undefined}
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                      }
                      title={item.User.full_name}
                      description={
                        <>
                          <Paragraph>{item.content}</Paragraph>
                          <Text type="secondary">{new Date(item.created_at).toLocaleString()}</Text>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </TabPane>
            <TabPane tab="Reports" key="4">
              <List
                itemLayout="horizontal"
                dataSource={mediaDetails.reports}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={<UserOutlined />}
                          src={item.User.img_url ? `http://localhost:3001${item.User.img_url}` : undefined}
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                      }
                      title={item.User.full_name}
                      description={
                        <>
                          <Paragraph>
                            <Text strong>Type:</Text> {item.report_type}
                          </Paragraph>
                          <Paragraph>
                            <Text strong>Description:</Text> {item.description}
                          </Paragraph>
                          <Paragraph>
                            <Text strong>Status:</Text> <Tag color={item.status === 'Accepted' ? 'red' : 'green'}>{item.status}</Tag>
                          </Paragraph>
                          <Text type="secondary">{new Date(item.created_at).toLocaleString()}</Text>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  )
}