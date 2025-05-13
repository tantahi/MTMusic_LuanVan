'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { PlusOutlined, CloudUploadOutlined } from '@ant-design/icons'
import { Modal, Upload, Input, Select, Button, Card, List, message, Form } from 'antd'
import { useRouter } from 'next/navigation'
import { userAtom, tokenAtom } from '@/lib/atom/user.atom'
import { useAtomValue } from 'jotai'
import mediaService from '@/services/media.service'
import { MediaType } from '@/types'
import type { UploadFile } from 'antd/es/upload/interface'

interface Playlist {
  id: number
  name: string
  description: string
  genre: string
  tracks: number
  date: string
  img_url: string
  type: string
}

export default function PlaylistManager() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [imgFile, setImgFile] = useState<UploadFile | null>(null)
  const [form] = Form.useForm()
  const router = useRouter()
  const token = useAtomValue(tokenAtom)

  const fetchPlaylists = useCallback(async () => {
    if (!token) {
      console.log('Token not available, skipping playlist fetch')
      return
    }
    try {
      const fetchedPlaylists = await mediaService.getMyPlaylist(token)
      setPlaylists(fetchedPlaylists.map((playlist: MediaType) => ({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description || '',
        genre: playlist.genre || '',
        tracks: playlist.tracks?.length || 0,
        date: new Date(playlist.createdAt).toLocaleDateString('en-GB'),
        img_url: playlist.img_url || '/placeholder.svg',
        type: playlist.type || 'Playlist',
      })))
    } catch (error) {
      console.error('Failed to fetch playlists:', error)
      message.error('Failed to load playlists')
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchPlaylists()
    }
  }, [token, fetchPlaylists])

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
    setImgFile(null)
  }

  const handleCreate = async () => {
    if (!token) {
      message.error('You need to be logged in to create a playlist')
      return
    }
    try {
      const values = await form.validateFields()
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('description', values.description)
      formData.append('genre', values.genre)
      formData.append('type', 'Playlist')
      if (imgFile && imgFile.originFileObj) {
        formData.append('img_url', imgFile.originFileObj)
      }

      const createdPlaylist = await mediaService.createPlaylist(formData, token)
      if (createdPlaylist.success === false) {
        throw new Error(createdPlaylist.message || 'Failed to create playlist')
      }
      handleCancel()
      await fetchPlaylists()
      message.success('Playlist created successfully')
    //   router.push(`/playlist/${createdPlaylist.id}`)
    } catch (error) {
      console.error('Failed to create playlist:', error)
      message.error(error.message || 'Failed to create playlist')
    }
  }

  const handleImageUpload = ({ fileList }: { fileList: UploadFile[] }) => {
    setImgFile(fileList[0])
  }

  if (!token) {
    return <div className="p-6">Please log in to view your playlists.</div>
  }

  return (
    <section className="my_playlist_page p-6">
      <h2 className="text-2xl font-semibold mb-4">My Playlists</h2>
      <p className="text-sm text-gray-500 mb-6">Curate your sounds and tracks at the go.</p>
      
      <List
        grid={{ gutter: 16, column: 4 }}
        dataSource={[...playlists, { id: 'add' }]}
        renderItem={(item) => (
          <List.Item>
            {item.id === 'add' ? (
              <Card hoverable onClick={showModal} className="flex items-center justify-center h-full">
                <PlusOutlined className="text-4xl" />
                <p className="mt-2">Add new playlist</p>
              </Card>
            ) : (
              <Card
                hoverable
                cover={<Image alt={item.name} src={'http://localhost:3001' + item.img_url} width={200} height={200} />}
                onClick={() => router.push(`/home/playlist/${item.id}`)}
              >
                <Card.Meta
                  title={item.name}
                  description={
                    <>
                      <p>{item.description}</p>
                      <p>{item.genre}</p>
                      <p>{item.tracks} track{item.tracks !== 1 ? 's' : ''}</p>
                      <p>{item.date}</p>
                    </>
                  }
                />
              </Card>
            )}
          </List.Item>
        )}
      />

      <Modal
        title="Create New Playlist"
        visible={isModalVisible}
        onOk={handleCreate}
        onCancel={handleCancel}
        okText="Create"
      >
        <Form form={form} layout="vertical" name="create_playlist_form">
          <Form.Item
            name="img_url"
            label="Cover Image"
            rules={[{ required: true, message: 'Please upload an image!' }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => e && e.fileList}
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
              onChange={handleImageUpload}
            >
              <div>
                <CloudUploadOutlined />
                <div className="mt-2">Upload</div>
              </div>
            </Upload>
          </Form.Item>
          <Form.Item
            name="name"
            label="Playlist Name"
            rules={[{ required: true, message: 'Please input the playlist name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Playlist Description"
            rules={[{ required: true, message: 'Please input the playlist description!' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="genre"
            label="Genre"
            rules={[{ required: true, message: 'Please select a genre!' }]}
          >
            <Select>
              <Select.Option value="Pop">Pop</Select.Option>
              <Select.Option value="Rap">Rap</Select.Option>
              <Select.Option value="Jazz">Jazz</Select.Option>
              <Select.Option value="Classic">Classic</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </section>
  )
}