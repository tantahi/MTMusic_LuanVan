'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAtomValue } from 'jotai'
import { tokenAtom } from '@/lib/atom/user.atom'
import { Table, Button, Input, Form, message, Space, Card, Typography, Divider, Select, Upload } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons'
import DefaultLayout from '@/components/Layouts/DefaultLayout'
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb'
import { useParams } from 'next/navigation'
import Image from 'next/image'

const { Title, Text } = Typography
const { Option } = Select

interface Track {
  id: number;
  name: string;
  artist: string;
}

interface PlaylistAlbum {
  id: number;
  name: string;
  artist_name: string | null;
  genre: string | null;
  img_url: string | null;
  user_id: number;
  type: 'Album' | 'Playlist' | 'Favourite';
  created_at: string;
  totalItems: number;
}

const API_BASE_URL = 'http://localhost:3001'

export default function Component() {
  const { id } = useParams()
  const [item, setItem] = useState<PlaylistAlbum | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [form] = Form.useForm()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Track[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const token = useAtomValue(tokenAtom)

  useEffect(() => {
    if (id) {
      fetchItemDetails()
      fetchTracks()
    }
  }, [id])

  const fetchItemDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/media/playlist/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setItem(response.data.data.playlist)
      if (response.data.data.playlist.img_url) {
        setImagePreview(`${API_BASE_URL}${response.data.data.playlist.img_url}`)
      }
    } catch (error) {
      console.error('Error fetching playlist details:', error)
      message.error('Failed to fetch playlist details')
    }
  }

  const fetchTracks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/media/playlist/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTracks(response.data.data.medias || [])
    } catch (error) {
      console.error('Error fetching tracks:', error)
      message.error('Failed to fetch tracks')
    }
  }

  const handleSearch = async (value: string) => {
    setSearchTerm(value)
    try {
      const response = await axios.get(`${API_BASE_URL}/media/search?q=${value}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSearchResults(response.data.data)
    } catch (error) {
      console.error('Error searching tracks:', error)
      message.error('Failed to search tracks')
    }
  }

  const handleAddTrack = async (track: Track) => {
    if (!item) return
    if (!tracks.some(t => t.id === track.id)) {
      try {
        await axios.post(`${API_BASE_URL}/media/playlist/${item.id}/add`, { mediaId: track.id }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setTracks(prevTracks => [...prevTracks, track])
        message.success(`Added "${track.name}" to the ${item.type}`)
      } catch (error) {
        console.error('Error adding track:', error)
        message.error('Failed to add track')
      }
    } else {
      message.warning(`This track is already in the ${item.type}`)
    }
  }

  const handleRemoveTrack = async (trackId: number) => {
    if (!item) return
    try {
      await axios.delete(`${API_BASE_URL}/media/playlist/${item.id}/remove`, {
        data: { mediaId: trackId },
        headers: { Authorization: `Bearer ${token}` }
      })
      setTracks(prevTracks => prevTracks.filter(track => track.id !== trackId))
      message.success(`Track removed from the ${item.type}`)
    } catch (error) {
      console.error('Error removing track:', error)
      message.error('Failed to remove track')
    }
  }

  const handleUpdateItem = async () => {
    if (!item) return
    try {
      const values = await form.validateFields()
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('artist_name', values.artist_name)
      formData.append('genre', values.genre)
      formData.append('type', values.type)
      if (imageFile) {
        formData.append('img_url', imageFile, imageFile.name)
      }

      const response = await axios.put(`${API_BASE_URL}/media/playlist/${item.id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      setItem(response.data.data)
      setIsEditing(false)
      message.success(`${values.type} updated successfully`)
      fetchItemDetails() // Refresh the item details to get the updated image URL
    } catch (error) {
      console.error('Error updating playlist:', error)
      message.error(`Failed to update ${item.type}`)
    }
  }

  const handleImageUpload = ({ file }: any) => {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    message.success(`${file.name} file selected successfully`)
  }

  const columns = [
    { title: 'Track Name', dataIndex: 'name', key: 'name' },
    { title: 'Artist', dataIndex: 'artist', key: 'artist' },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Track) => (
        <Button icon={<DeleteOutlined />} onClick={() => handleRemoveTrack(record.id)} danger>
          Remove
        </Button>
      ),
    },
  ]

  if (!item) {
    return <DefaultLayout><div>Loading...</div></DefaultLayout>
  }

  return (
    <DefaultLayout>
      <Breadcrumb pageName={`${item.type} Details`} />
      <div className="grid w-full gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <Card className="col-span-full">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-grow">
              {isEditing ? (
                <Form form={form} layout="vertical" initialValues={item} onFinish={handleUpdateItem}>
                  <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: `Please input the ${item.type} name!` }]}
                  >
                    <Input placeholder={`${item.type} Name`} />
                  </Form.Item>
                  <Form.Item
                    name="artist_name"
                    label="Artist Name"
                    rules={[{ required: true, message: 'Please input the artist name!' }]}
                  >
                    <Input placeholder="Artist Name" />
                  </Form.Item>
                  <Form.Item
                    name="genre"
                    label="Genre"
                    rules={[{ required: true, message: 'Please select the genre!' }]}
                  >
                    <Select style={{ width: 120 }}>
                      <Option value="Pop">Pop</Option>
                      <Option value="Rap">Rap</Option>
                      <Option value="Jazz">Jazz</Option>
                      <Option value="Classical">Classical</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="type"
                    label="Type"
                    rules={[{ required: true, message: 'Please select the type!' }]}
                  >
                    <Select style={{ width: 120 }}>
                      <Option value="Album">Album</Option>
                      {/* <Option value="Playlist">Playlist</Option> */}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="img_url"
                    label="Cover Image"
                  >
                    <Upload
                      name="img_url"
                      listType="picture"
                      maxCount={1}
                      beforeUpload={() => false}
                      onChange={handleImageUpload}
                      showUploadList={false}
                    >
                      <Button icon={<UploadOutlined />}>Click to upload</Button>
                    </Upload>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                      Save
                    </Button>
                  </Form.Item>
                </Form>
              ) : (
                <>
                  <Title level={2}>{item.name}</Title>
                  <Text type="secondary">{item.artist_name || 'No artist'}</Text>
                  <div>
                    <Text>Type: {item.type}</Text>
                    <Text className="ml-4">Genre: {item.genre || 'Not specified'}</Text>
                  </div>
                  <Button onClick={() => setIsEditing(true)} icon={<EditOutlined />} className="mt-4">
                    Edit {item.type}
                  </Button>
                </>
              )}
            </div>
            <div className="ml-4">
              {imagePreview && (
                <Image
                  src={imagePreview}
                  alt={`${item.type} cover`}
                  width={200}
                  height={200}
                  objectFit="cover"
                />
              )}
            </div>
          </div>
          <Divider />
          <Text>Number of Tracks: {tracks.length}</Text>
        </Card>

        <Card title="Add Tracks" className="col-span-full md:col-span-1">
          <Input.Search
            placeholder="Search for tracks to add"
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="mb-4"
          />
          <div className="mb-4">
            <Title level={4}>Search Results:</Title>
            <Space direction="vertical" className="w-full">
              {searchResults.map(track => (
                <Button 
                  key={track.id} 
                  onClick={() => handleAddTrack(track)} 
                  icon={<PlusOutlined />}
                  className="w-full text-left"
                  disabled={tracks.some(t => t.id === track.id)}
                >
                  {track.name} - {track.artist}
                </Button>
              ))}
            </Space>
          </div>
        </Card>

        <Card title={`Tracks in this ${item.type}`} className="col-span-full md:col-span-3">
          <Table 
            columns={columns} 
            dataSource={tracks} 
            rowKey="id" 
            pagination={false}
          />
        </Card>
      </div>
    </DefaultLayout>
  )
}