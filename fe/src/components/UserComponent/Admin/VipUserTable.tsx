'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Table, Tag, Spin, message, Input, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { format } from 'date-fns'
import { Search, Eye } from 'lucide-react'
import Link from 'next/link'

interface VIPUser {
  id: number
  email: string
  full_name: string
  status: string
  vip_start_date: string
  vip_end_date: string
  report_count: number | null
  totalEarnings: number
  completedReceiptsCount: number
  pendingReceiptsCount: number
  rejectedReceiptsCount: number
  pricedSongsCount: number
  pricedPodcastsCount: number
  pricedAlbumsCount: number
}

export default function Component() {
  const [vipUsers, setVipUsers] = useState<VIPUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<VIPUser[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')

  useEffect(() => {
    const fetchVIPUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/users/all-vip-info')
        setVipUsers(response.data.data)
        setFilteredUsers(response.data.data)
      } catch (error) {
        console.error('Error fetching VIP users:', error)
        message.error('Failed to fetch VIP users')
      } finally {
        setLoading(false)
      }
    }

    fetchVIPUsers()
  }, [])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    const lowercasedValue = value.toLowerCase()
    const filtered = vipUsers.filter(
      (user) =>
        user.email.toLowerCase().includes(lowercasedValue) ||
        user.full_name.toLowerCase().includes(lowercasedValue) ||
        user.id.toString().includes(lowercasedValue)
    )
    setFilteredUsers(filtered)
  }

  const columns: ColumnsType<VIPUser> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Name',
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Inactive', value: 'Inactive' },
        { text: 'Banned', value: 'Banned' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : status === 'Inactive' ? 'orange' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'VIP Start',
      dataIndex: 'vip_start_date',
      key: 'vip_start_date',
      render: (date) => format(new Date(date), 'yyyy-MM-dd'),
      sorter: (a, b) => new Date(a.vip_start_date).getTime() - new Date(b.vip_start_date).getTime(),
    },
    {
      title: 'VIP End',
      dataIndex: 'vip_end_date',
      key: 'vip_end_date',
      render: (date) => format(new Date(date), 'yyyy-MM-dd'),
      sorter: (a, b) => new Date(a.vip_end_date).getTime() - new Date(b.vip_end_date).getTime(),
    },
    {
      title: 'Priced Songs',
      dataIndex: 'pricedSongsCount',
      key: 'pricedSongsCount',
      sorter: (a, b) => a.pricedSongsCount - b.pricedSongsCount,
    },
    {
      title: 'Priced Podcasts',
      dataIndex: 'pricedPodcastsCount',
      key: 'pricedPodcastsCount',
      sorter: (a, b) => a.pricedPodcastsCount - b.pricedPodcastsCount,
    },
    // {
    //   title: 'Priced Albums',
    //   dataIndex: 'pricedAlbumsCount',
    //   key: 'pricedAlbumsCount',
    //   sorter: (a, b) => a.pricedAlbumsCount - b.pricedAlbumsCount,
    // },
    // {
    //   title: 'Reports',
    //   dataIndex: 'report_count',
    //   key: 'report_count',
    //   render: (count) => count || 0,
    //   sorter: (a, b) => (a.report_count || 0) - (b.report_count || 0),
    // },
    {
        title: 'Earnings',
        dataIndex: 'totalEarnings',
        key: 'totalEarnings',
        render: (earnings: number) => `$${(earnings / 100).toFixed(2)}`,
        sorter: (a: { totalEarnings: number }, b: { totalEarnings: number }) => a.totalEarnings - b.totalEarnings,
      },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Link href={`/admin/vip-user/${record.id}`} passHref>
          <Button
            type="primary"
            icon={<Eye className="h-4 w-4" />}
            size="small"
            className="flex items-center"
          >
            View
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <div className="">
      <div className="mb-4">
        <Input
          placeholder="Search by ID, Email, or Name"
          onChange={(e) => handleSearch(e.target.value)}
          value={searchQuery}
          prefix={<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />}
          className="max-w-sm"
        />
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-[calc(100vh-100px)]">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          onChange={(pagination, filters, sorter) => {
            console.log('Table change:', pagination, filters, sorter)
          }}
        />
      )}
    </div>
  )
}