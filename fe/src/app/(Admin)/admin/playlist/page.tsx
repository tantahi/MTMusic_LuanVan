'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAtomValue } from 'jotai'
import { tokenAtom } from '@/lib/atom/user.atom'
import { Table, Button, Modal, Form, Input, Select, message, Space, Upload } from 'antd'
import { PlusOutlined, SearchOutlined, UploadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import DefaultLayout from '@/components/Layouts/DefaultLayout'
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb'
import Link from 'next/link'

const API_BASE_URL = 'http://localhost:3001'

export default function PlaylistAlbumManager() {
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortedInfo, setSortedInfo] = useState({})
  const [form] = Form.useForm()
  const [imageFile, setImageFile] = useState(null)
  const token = useAtomValue(tokenAtom)

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    const filtered = items.filter(item => 
      (typeFilter === 'all' || item.type === typeFilter) &&
      (item.name.toLowerCase().includes(searchText.toLowerCase()) ||
       (item.artist_name && item.artist_name.toLowerCase().includes(searchText.toLowerCase())))
    )
    setFilteredItems(filtered)
  }, [items, searchText, typeFilter])

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/media/playlist`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const filteredItems = response.data.data.filter(item => item.type !== 'Favourite')
      setItems(filteredItems)
    } catch (error) {
      console.error('Error fetching playlists:', error)
      message.error('Failed to fetch playlists')
    }
  }

  const handleCreate = () => {
    setModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('type', values.type)
      formData.append('artist_name', values.artist_name)
      if (imageFile) {
        formData.append('img_url', imageFile, imageFile.name)
      }

      const response = await axios.post(`${API_BASE_URL}/media/playlist/create`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      setItems([...items, response.data.data])
      setModalVisible(false)
      form.resetFields()
      setImageFile(null)
      message.success(`${values.type.charAt(0).toUpperCase() + values.type.slice(1)} created successfully`)
    } catch (error) {
      console.error('Error creating playlist:', error)
      message.error('Failed to create item')
    }
  }

  const handleImageUpload = ({ file }) => {
    setImageFile(file)
    message.success(`${file.name} file selected successfully`)
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/media/playlist/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setItems(items.filter(item => item.id !== id))
      message.success('Item deleted successfully')
    } catch (error) {
      console.error('Error deleting item:', error)
      message.error('Failed to delete item')
    }
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
    },
    // { 
    //   title: 'Artist/Creator', 
    //   dataIndex: 'artist_name', 
    //   key: 'artist_name',
    //   sorter: (a, b) => (a.artist_name || '').localeCompare(b.artist_name || ''),
    //   sortOrder: sortedInfo.columnKey === 'artist_name' && sortedInfo.order,
    // },
    { 
      title: 'Number of Songs', 
      dataIndex: 'song_count', 
      key: 'song_count',
      sorter: (a, b) => a.song_count - b.song_count,
      sortOrder: sortedInfo.columnKey === 'song_count' && sortedInfo.order,
    },
    { 
      title: 'Type', 
      dataIndex: 'type', 
      key: 'type', 
      sorter: (a, b) => a.type.localeCompare(b.type),
      sortOrder: sortedInfo.columnKey === 'type' && sortedInfo.order,
      render: (text) => text.charAt(0).toUpperCase() + text.slice(1),
    },
    {
      title: 'Image',
      dataIndex: 'img_url',
      key: 'img_url',
      render: (text) => text ? <img src={`${API_BASE_URL}${text}`} alt="Playlist" style={{ width: 50, height: 50, objectFit: 'cover' }} /> : 'No Image',
    },
    {
      title: 'Created By',
      dataIndex: ['User', 'full_name'],
      key: 'created_by',
      sorter: (a, b) => a.User?.full_name.localeCompare(b.User?.full_name),
      sortOrder: sortedInfo.columnKey === 'created_by' && sortedInfo.order,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Link href={`/admin/playlist/${record.id}`}>
            <Button icon={<EditOutlined />}>Edit</Button>
          </Link>
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} danger>Delete</Button>
        </Space>
      ),
    },
  ]

  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter)
  }

  const handleSearch = (value) => {
    setSearchText(value)
  }

  const handleTypeFilter = (value) => {
    setTypeFilter(value)
  }

  const clearAll = () => {
    setSearchText('')
    setTypeFilter('all')
    setSortedInfo({})
  }

  return (
    <DefaultLayout>
      <Breadcrumb pageName='Album'/>
      <div className="w-full p-4 m-0">
        <Space className="mb-4 w-full">
          <Input
            placeholder="Search by name or artist"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            value={searchText}
            style={{ width: 300 }}
          />
          {/* <Select
            value={typeFilter}
            style={{ width: 120 }}
            onChange={handleTypeFilter}
          >
            <Select.Option value="all">All Types</Select.Option>
            <Select.Option value="Album">Albums</Select.Option>
            <Select.Option value="Playlist">Playlists</Select.Option>
          </Select> */}
          {/* <Button onClick={clearAll}>Clear filters and sorters</Button> */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Create New Album
          </Button>
        </Space>
        <Table 
          columns={columns} 
          dataSource={filteredItems} 
          rowKey="id" 
          onChange={handleChange}
        />
        <Modal
          title="Create New Album"
          open={modalVisible}
          onOk={handleModalOk}
          onCancel={() => {
            setModalVisible(false)
            form.resetFields()
            setImageFile(null)
          }}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please input the name!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: 'Please select the type!' }]}
            >
              <Select>
                <Select.Option value="Album">Album</Select.Option>
                {/* <Select.Option value="Playlist">Playlist</Select.Option> */}
              </Select>
            </Form.Item>
            <Form.Item
              name="artist_name"
              label="Artist"
              rules={[{ required: true, message: 'Please input the artist name!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="img_url"
              label="Playlist Image"
            >
              <Upload
                name="img_url"
                listType="picture"
                maxCount={1}
                beforeUpload={() => false}
                onChange={handleImageUpload}
              >
                <Button icon={<UploadOutlined />}>Click to upload</Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DefaultLayout>
  )
}

