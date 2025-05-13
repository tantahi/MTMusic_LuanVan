'use client'

import React, { useState, useEffect } from 'react'
import { Table, Input, Space, Typography, DatePicker, Tooltip, Modal } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { SearchOutlined } from '@ant-design/icons'
import axios from 'axios'
import PaymentDetailsModal from './PaymentDetailModal'
import { useAtomValue } from 'jotai'
import { tokenAtom } from '@/lib/atom/user.atom'

const { Text } = Typography
const { RangePicker } = DatePicker

interface User {
  id: number
  full_name: string
}

interface Payment {
  id: number
  totalAmount: string
  status: string
  requestNote: string
  approvalNote: string | null
  requestedAt: string
  approvedAt: string | null
  completedAt: string | null
  totalReceipts: number
  totalReceiptsValue: number
  totalTax: number
  requester: User
  approver: User | null
}

const NoteDisplay: React.FC<{ note: string }> = ({ note }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const truncatedNote = note.length > 50 ? `${note.substring(0, 50)}...` : note;

  return (
    <>
      <Tooltip title="Click to view full note">
        <span 
          className="cursor-pointer text-blue-600 hover:text-blue-800"
          onClick={() => setIsModalVisible(true)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsModalVisible(true);
            }
          }}
        >
          {truncatedNote}
        </span>
      </Tooltip>
      <Modal
        title="Request Note"
        open={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <p className="whitespace-pre-wrap">{note}</p>
      </Modal>
    </>
  );
};

export default function AllPaymentsTable() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const token = useAtomValue(tokenAtom)

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    const filtered = payments.filter(payment => 
      payment.requester.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.id.toString().includes(searchText) ||
      (payment.approver && payment.approver.full_name.toLowerCase().includes(searchText.toLowerCase()))
    )
    setFilteredPayments(filtered)
  }, [searchText, payments])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await axios.get<{ success: boolean; data: Payment[] }>('http://localhost:3001/payments', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success && response.data.data.length > 0) {
        setPayments(response.data.data)
        setFilteredPayments(response.data.data)
      } else {
        setPayments([])
        setFilteredPayments([])
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return isNaN(numValue) ? 'Invalid Amount' : `$${(numValue / 100).toFixed(2)}`
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const columns: ColumnsType<Payment> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Requester',
      dataIndex: ['requester', 'full_name'],
      key: 'requester',
      sorter: (a, b) => a.requester.full_name.localeCompare(b.requester.full_name),
    },
    {
      title: 'Approver',
      dataIndex: ['approver', 'full_name'],
      key: 'approver',
      render: (_, record) => {
        if (record.status === 'Completed' && !record.approver) {
          return 'Auto-approved'
        }
        return record.approver?.full_name || 'N/A'
      },
    },
    {
      title: 'Request Note',
      dataIndex: 'requestNote',
      key: 'requestNote',
      render: (note: string) => <NoteDisplay note={note} />,
      sorter: (a, b) => a.requestNote.localeCompare(b.requestNote),
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (value: string) => formatCurrency(parseFloat(value)),
      sorter: (a, b) => parseFloat(a.totalAmount) - parseFloat(b.totalAmount),
    },
    {
      title: 'Total Receipts',
      dataIndex: 'totalReceipts',
      key: 'totalReceipts',
      sorter: (a, b) => a.totalReceipts - b.totalReceipts,
    },
    {
      title: 'Total Receipts Value',
      dataIndex: 'totalReceiptsValue',
      key: 'totalReceiptsValue',
      render: (value: number) => formatCurrency(value),
      sorter: (a, b) => a.totalReceiptsValue - b.totalReceiptsValue,
    },
    {
      title: 'Total Tax',
      dataIndex: 'totalTax',
      key: 'totalTax',
      render: (value: number) => formatCurrency(value),
      sorter: (a, b) => a.totalTax - b.totalTax,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: 'Dates',
      key: 'dates',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text><strong>Requested:</strong> {formatDate(record.requestedAt)}</Text>
          <Text><strong>Approved:</strong> {formatDate(record.approvedAt)}</Text>
        </Space>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <PaymentDetailsModal id={record.id} />
        </Space>
      ),
    },
  ]

  return (
    <div className="container mx-auto p-4">
      <Input
        placeholder="Search by name or ID"
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <Table
        columns={columns}
        dataSource={filteredPayments}
        rowKey="id"
        loading={loading}
        scroll={{ x: true }}
      />
    </div>
  )
}

