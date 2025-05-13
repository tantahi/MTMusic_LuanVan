'use client'

import { useEffect, useState } from 'react'
import { useAtomValue } from 'jotai'
import { userAtom, tokenAtom } from '@/lib/atom/user.atom'
import { Table, Typography, Spin } from 'antd'
import { ColumnsType } from 'antd/es/table'
import axios from 'axios'

const { Title } = Typography

interface PaymentReceipt {
  id: number
  tax: number
  price: number
  total: number
  status: string
  item_type: string
  item_name: string
  item_id: number
  created_at: string
  updated_at: string
  Buyer: {
    id: number
    full_name: string
  }
  Seller: {
    id: number
    full_name: string
  }
  MediaItem?: {
    id: number
    name: string
    media_type: string
  }
  PlaylistItem?: {
    id: number
    name: string
    type: string
  }
  Payment: {
    id: number
    status: string
    requestedAt: string
    approvedAt: string
    completedAt: string
  }
}

export default function PaymentReceiptsPage() {
  const user = useAtomValue(userAtom)
  const token = useAtomValue(tokenAtom)
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([])
  const [loading, setLoading] = useState(false)
  const [apiMessage, setApiMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchReceipts = async () => {
      if (!user?.id || !token) {
        return
      }

      setLoading(true)

      try {
        const response = await axios.get(`http://localhost:3001/payments/user/${user.id}/receipts`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.data.success) {
          setReceipts(response.data.data)
          setApiMessage(response.data.message)
        } else {
          throw new Error(response.data.message)
        }
      } catch (error) {
        console.error('Error fetching receipts:', error)
        setApiMessage(error instanceof Error ? error.message : 'An error occurred while fetching receipts')
      } finally {
        setLoading(false)
      }
    }

    fetchReceipts()
  }, [user, token])

  const formatCurrency = (value: number) => {
    return `$${(value / 100).toFixed(2)}`
  }

  const columns: ColumnsType<PaymentReceipt> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Item',
      dataIndex: 'item_name',
      key: 'item_name',
    },
    {
      title: 'Type',
      dataIndex: 'item_type',
      key: 'item_type',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatCurrency(price),
    },
    {
      title: 'Tax',
      dataIndex: 'tax',
      key: 'tax',
      render: (tax: number) => formatCurrency(tax),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => formatCurrency(total),
    },
    {
      title: 'Seller',
      dataIndex: ['Seller', 'full_name'],
      key: 'seller',
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    )
  }

  if (!user || !token) {
    return (
      <div className="container mx-auto p-4">
        <Title level={2} className="mb-4">Payment Receipts</Title>
        <p>Please log in to view your payment receipts.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Title level={2} className="mb-4">Your Payment Receipts</Title>
      {apiMessage && <p className="mb-4">{apiMessage}</p>}
      {receipts.length > 0 ? (
        <Table
          columns={columns}
          dataSource={receipts}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      ) : null}
    </div>
  )
}

