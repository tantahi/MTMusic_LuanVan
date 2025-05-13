'use client'

import React, { useEffect, useState } from 'react'
import { Table, Tag, Spin, message, Input, Button, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { format } from 'date-fns'
import { SearchOutlined, EyeOutlined } from '@ant-design/icons'
import Link from 'next/link'

const { Option } = Select

interface StaffUser {
  id: number
  email: string
  full_name: string
  status: string
  created_at: string
  processedMediaCount: number
  processedReportsCount: number
  processedPaymentsCount: number
}

export default function Component() {
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<StaffUser[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    const fetchStaffUsers = async () => {
      try {
        const response = await fetch('http://localhost:3001/users/all-staff')
        if (!response.ok) {
          throw new Error('Failed to fetch staff users')
        }
        const data = await response.json()
        setStaffUsers(data.data)
        setFilteredUsers(data.data)
      } catch (error) {
        console.error('Error fetching staff users:', error)
        message.error('Failed to fetch staff users')
      } finally {
        setLoading(false)
      }
    }

    fetchStaffUsers()
  }, [])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    filterUsers(value, statusFilter)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    filterUsers(searchQuery, value)
  }

  const filterUsers = (search: string, status: string) => {
    const lowercasedValue = search.toLowerCase()
    const filtered = staffUsers.filter(
      (user) =>
        (user.email.toLowerCase().includes(lowercasedValue) ||
        user.full_name.toLowerCase().includes(lowercasedValue) ||
        user.id.toString().includes(lowercasedValue)) &&
        (status === 'all' || user.status === status)
    )
    setFilteredUsers(filtered)
  }

  const columns: ColumnsType<StaffUser> = [
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
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : status === 'Inactive' ? 'orange' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => format(new Date(date), 'yyyy-MM-dd'),
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Processed Media',
      dataIndex: 'processedMediaCount',
      key: 'processedMediaCount',
      sorter: (a, b) => a.processedMediaCount - b.processedMediaCount,
    },
    {
      title: 'Processed Reports',
      dataIndex: 'processedReportsCount',
      key: 'processedReportsCount',
      sorter: (a, b) => a.processedReportsCount - b.processedReportsCount,
    },
    // {
    //   title: 'Processed Payments',
    //   dataIndex: 'processedPaymentsCount',
    //   key: 'processedPaymentsCount',
    //   sorter: (a, b) => a.processedPaymentsCount - b.processedPaymentsCount,
    // },
    // {
    //   title: 'Action',
    //   key: 'action',
    //   render: (_, record) => (
    //     <Link href={`/admin/staff/${record.id}`} passHref>
    //       <Button
    //         type="primary"
    //         icon={<EyeOutlined />}
    //         size="small"
    //       >
    //         View
    //       </Button>
    //     </Link>
    //   ),
    // },
  ]

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <Input
          placeholder="Search by ID, Email, or Name"
          onChange={(e) => handleSearch(e.target.value)}
          value={searchQuery}
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
        />
        <Select
          defaultValue="all"
          style={{ width: 150 }}
          onChange={handleStatusFilter}
        >
          <Option value="all">All Statuses</Option>
          <Option value="Active">Active</Option>
          <Option value="Inactive">Inactive</Option>
          <Option value="Banned">Banned</Option>
        </Select>
      </div>
      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </div>
  )
}