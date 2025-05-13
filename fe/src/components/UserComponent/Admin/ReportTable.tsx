'use client'

import React, { useEffect, useState } from 'react'
import { Table, Space, Button, message, Spin, Input, Modal, Select, Checkbox } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EyeOutlined, FileTextOutlined } from '@ant-design/icons'
import axios from 'axios'
import { useAtomValue } from 'jotai'
import { tokenAtom } from '@/lib/atom/user.atom'
import MediaDetailsModal from './MediaDetailModal'

const { Search } = Input
const { Option } = Select

interface ReportType {
  id: number
  name: string
  artist_name: string
  author: string
  report_count: number
  likes_count: number
  price: string // Price in cents
  media_type: 'Song' | 'Podcast'
}

interface ReportDetailType {
  id: number
  user_id: number
  report_type: 'Spam' | 'Inappropriate Content' | 'Copyright Violation' | 'Other'
  description: string
  status: 'Pending' | 'Rejected' | 'Accepted'
  created_at: string
}

const reportTypes = ['Spam', 'Inappropriate Content', 'Copyright Violation', 'Other'] as const

export default function ReportTable() {
  const [reports, setReports] = useState<ReportType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'Song' | 'Podcast' | 'All'>('All')
  const [isReportModalVisible, setIsReportModalVisible] = useState(false)
  const [currentReports, setCurrentReports] = useState<ReportDetailType[]>([])
  const [currentMediaId, setCurrentMediaId] = useState<number | null>(null)
  const [selectedReportIds, setSelectedReportIds] = useState<number[]>([])
  const [sortField, setSortField] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('descend')
  const [newStatus, setNewStatus] = useState<'Pending' | 'Rejected' | 'Accepted'>('Pending')
  const [selectAll, setSelectAll] = useState(false)
  const [reportTypeFilters, setReportTypeFilters] = useState<string[]>([])
  const token = useAtomValue(tokenAtom)

  useEffect(() => {
    if (token) {
      fetchReports()
    } else {
      setLoading(false)
      setError('No authentication token found')
    }
  }, [token])

  useEffect(() => {
    setSelectAll(selectedReportIds.length === currentReports.length && currentReports.length > 0)
  }, [selectedReportIds, currentReports])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:3001/reports', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setReports(response.data.data)
        setError(null)
      } else {
        throw new Error(response.data.message || 'Failed to fetch reports')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reports')
      message.error(err.message || 'Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleMediaTypeChange = (value: 'Song' | 'Podcast' | 'All') => {
    setMediaTypeFilter(value)
  }

  const filteredReports = reports.filter(item =>
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.artist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.author.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (mediaTypeFilter === 'All' || item.media_type === mediaTypeFilter)
  )

  const formatPrice = (price: string) => {
    const priceInCents = parseInt(price)
    if (priceInCents === 0) return 'Free'
    return `$${(priceInCents / 100).toFixed(2)}`
  }

  const showReportModal = async (mediaId: number) => {
    try {
      const response = await axios.get(`http://localhost:3001/reports/media/${mediaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setCurrentReports(response.data.data)
        setCurrentMediaId(mediaId)
        setIsReportModalVisible(true)
      } else {
        throw new Error(response.data.message || 'Failed to fetch report details')
      }
    } catch (err: any) {
      message.error(err.message || 'Failed to fetch report details')
    }
  }

  const handleStatusChange = async (reportIds: number[], newStatus: string) => {
    try {
      for (const id of reportIds) {
        const response = await axios.put(`http://localhost:3001/reports/${id}`, 
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!response.data.success) {
          throw new Error(`Failed to update report ${id}`)
        }
      }
      message.success('Report statuses updated successfully')
      setCurrentReports(currentReports.map(report => 
        reportIds.includes(report.id) ? { ...report, status: newStatus as 'Pending' | 'Rejected' | 'Accepted' } : report
      ))
      fetchReports()
    } catch (err: any) {
      message.error(err.message || 'Failed to update report statuses')
    }
  }

  const handleReportTypeFilterChange = (checkedValues: string[]) => {
    setReportTypeFilters(checkedValues)
  }

  const columns: ColumnsType<ReportType> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Media Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Artist',
      dataIndex: 'artist_name',
      key: 'artist_name',
      sorter: (a, b) => a.artist_name.localeCompare(b.artist_name),
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      sorter: (a, b) => a.author.localeCompare(b.author),
    },
    {
      title: 'Media Type',
      dataIndex: 'media_type',
      key: 'media_type',
      sorter: (a, b) => a.media_type.localeCompare(b.media_type),
    },
    {
      title: 'New Report Count',
      dataIndex: 'report_count',
      key: 'report_count',
      sorter: (a, b) => a.report_count - b.report_count,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => parseInt(a.price) - parseInt(b.price),
      render: (price) => formatPrice(price),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <MediaDetailsModal id={record.id} />
          <Button icon={<FileTextOutlined />} onClick={() => showReportModal(record.id)}>Change Reports</Button>
        </Space>
      ),
    },
  ]

  const reportDetailColumns: ColumnsType<ReportDetailType> = [
    { 
      title: (
        <Checkbox
          checked={selectAll}
          onChange={(e) => {
            setSelectAll(e.target.checked)
            setSelectedReportIds(e.target.checked ? currentReports.map(report => report.id) : [])
          }}
        >
          Select All
        </Checkbox>
      ),
      key: 'select',
      render: (_, record) => (
        <Checkbox
          checked={selectedReportIds.includes(record.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedReportIds([...selectedReportIds, record.id])
            } else {
              setSelectedReportIds(selectedReportIds.filter(id => id !== record.id))
              setSelectAll(false)
            }
          }}
        />
      )
    },
    { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id },
    { title: 'User ID', dataIndex: 'user_id', key: 'user_id', sorter: (a, b) => a.user_id - b.user_id },
    { 
      title: 'Type', 
      dataIndex: 'report_type', 
      key: 'report_type', 
      render: (type) => {
        const colorMap = {
          'Spam': 'text-yellow-500',
          'Inappropriate Content': 'text-red-500',
          'Copyright Violation': 'text-orange-500',
          'Other': 'text-blue-500'
        }
        return <span className={colorMap[type] || ''}>{type}</span>
      },
      filters: reportTypes.map(type => ({ text: type, value: type })),
      onFilter: (value, record) => record.report_type === value,
    },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status) => (
        <span className={`${status === 'Accepted' ? 'text-green-500' : status === 'Rejected' ? 'text-red-500' : 'text-yellow-500'}`}>
          {status}
        </span>
      )
    },
    { 
      title: 'Created At', 
      dataIndex: 'created_at', 
      key: 'created_at',
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (date) => new Date(date).toLocaleString()
    },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="m-0 w-full p-4">
      <Space direction="vertical" size="middle" className="w-full">
        <div className="flex justify-between items-center">
          <Search
            placeholder="Search by media name, artist, or author"
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Select
            defaultValue="All"
            style={{ width: 120 }}
            onChange={handleMediaTypeChange}
          >
            <Option value="All">All Types</Option>
            <Option value="Song">Song</Option>
            <Option value="Podcast">Podcast</Option>
          </Select>
        </div>
        <Table 
          columns={columns} 
          dataSource={filteredReports} 
          rowKey="id"
        />
      </Space>
      <Modal
        title="Report Details"
        visible={isReportModalVisible}
        onCancel={() => {
          setIsReportModalVisible(false)
          setSelectedReportIds([])
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setIsReportModalVisible(false)
            setSelectedReportIds([])
          }}>
            Close
          </Button>
        ]}
        width={1000}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="mr-2 font-bold">Change selected to:</span>
            <Select
              style={{ width: 120 }}
              value={newStatus}
              onChange={(value: 'Pending' | 'Rejected' | 'Accepted') => setNewStatus(value)}
            >
              <Option value="Pending">Pending</Option>
              <Option value="Rejected">Rejected</Option>
              <Option value="Accepted">Accepted</Option>
            </Select>
          </div>
          <Button 
            type="primary" 
            disabled={selectedReportIds.length === 0}
            onClick={() => handleStatusChange(selectedReportIds, newStatus)}
          >
            Change {selectedReportIds.length} Selected
          </Button>
        </div>
        <div className="mb-4">
          <span className="font-bold mr-2">Filter by Type:</span>
          <Checkbox.Group 
            options={reportTypes} 
            value={reportTypeFilters}
            onChange={handleReportTypeFilterChange}
          />
        </div>
        <Table
          dataSource={currentReports.filter(report => reportTypeFilters.length === 0 || reportTypeFilters.includes(report.report_type))}
          columns={reportDetailColumns}
          rowKey="id"
          onChange={(pagination, filters, sorter) => {
            if (Array.isArray(sorter)) {
              setSortField(sorter[0].field as string)
              setSortOrder(sorter[0].order as 'ascend' | 'descend')
            } else {
              setSortField(sorter.field as string)
              setSortOrder(sorter.order as 'ascend' | 'descend')
            }
          }}
        />
      </Modal>
    </div>
  )
}