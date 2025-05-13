'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAtomValue } from 'jotai'
import { userAtom, tokenAtom } from '@/lib/atom/user.atom'
import { Table, Typography, Spin, Alert, Tag, Result, message, Button, Modal } from 'antd'
import { ColumnsType } from 'antd/es/table'
import PaymentDetailsModal from '@/components/UserComponent/PaymentDetailsModal'
import { useRouter } from 'next/navigation'

const { Title } = Typography

interface Payment {
  id: number
  ownerName: string
  totalAmount: number | string
  totalReceipts: number
  totalReceiptsValue: number | string
  requestedAt: string
  status: string
}

interface User {
  id: number
  full_name: string
  paypalAccountId?: string
  paypalEmail?: string
}

export default function LatestPaymentsPage() {
  const user = useAtomValue(userAtom) as User
  const token = useAtomValue(tokenAtom)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const router = useRouter()

  const fetchLatestPayments = async () => {
    if (!user || !token) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`http://localhost:3001/payments/user/${user.id}/latest`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setPayments(response.data.data)
      } else {
        setError(response.data.message || 'Failed to fetch payments')
      }
    } catch (err) {
      setError('An error occurred while fetching payments')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && token) {
      fetchLatestPayments()
    }
  }, [user, token])

  const formatCurrency = (value: number): string => {
    const amount = value / 100; // Divide by 100 here
    return isNaN(amount) ? 'Invalid Amount' : `$${amount.toFixed(2)}`;
  };

  const handleRequestPayment = async (paymentId: number) => {
    if (!user || !token) {
      message.error('User not authenticated')
      return
    }

    if (!user.paypalAccountId && !user.paypalEmail) {
      setIsModalVisible(true)
      return
    }

    try {
      const response = await axios.post(
        'http://localhost:3001/payments/request',
        { paymentId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        message.success('Payment request submitted successfully')
        fetchLatestPayments()
      } else {
        message.error(response.data.message || 'Failed to submit payment request')
      }
    } catch (err) {
      console.error('Error in requesting payment:', err)
      message.error('An error occurred while submitting the payment request')
    }
  }

  const redirectToAccount = () => {
    router.push('http://localhost:3000/home/myaccount')
  }

  const columns: ColumnsType<Payment> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Owner',
      dataIndex: 'ownerName',
      key: 'ownerName',
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number | string) => formatCurrency(amount),
    },
    {
      title: 'Total Receipts',
      dataIndex: 'totalReceipts',
      key: 'totalReceipts',
    },
    // {
    //   title: 'Total Receipts Value',
    //   dataIndex: 'totalReceiptsValue',
    //   key: 'totalReceiptsValue',
    //   render: (amount: number | string) => formatCurrency(amount),
    // },
    {
      title: 'Requested At',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Completed' ? 'green' : status === 'Pending' ? 'orange' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          <PaymentDetailsModal id={record.id} />
          {record.status === 'Pending' && (
            <Button
              onClick={() => handleRequestPayment(record.id)}
              style={{ marginLeft: '8px' }}
            >
              Request
            </Button>
          )}
        </>
      ),
    },
  ]

  if (!user || !token) {
    return (
      <Result
        status="warning"
        title="Authentication Required"
        subTitle="Please log in to view your latest payments."
      />
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    )
  }

  return (
    <div className="p-4">
      <Title level={2}>All Payment</Title>
      <Table columns={columns} dataSource={payments} rowKey="id" />
      <Modal
        title="PayPal Account Required"
        visible={isModalVisible}
        onOk={redirectToAccount}
        onCancel={() => setIsModalVisible(false)}
        okText="Go to My Account"
        cancelText="Cancel"
      >
        <p>You need to set up your PayPal account information before requesting a payment. Would you like to go to your account settings now?</p>
      </Modal>
    </div>
  )
}

