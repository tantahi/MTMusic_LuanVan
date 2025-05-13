import React, { useState, useEffect } from 'react';
import { Button, Modal, Descriptions, Table, Typography, Spin } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAtomValue } from 'jotai';
import { tokenAtom } from '@/lib/atom/user.atom';

const { Title } = Typography;

interface PaymentDetail {
  id: number;
  totalAmount: string;
  status: string;
  requestNote: string;
  approvalNote: string | null;
  requestedAt: string;
  approvedAt: string | null;
  completedAt: string | null;
  requester: {
    id: number;
    full_name: string;
  };
  approver: {
    id: number;
    full_name: string;
  } | null;
  receipts: Array<{
    id: number;
    tax: string;
    price: string;
    total: string;
    user_id: number;
    item_type: string;
    item_id: number;
    seller_id: number;
    item_name: string;
    Buyer: {
      id: number;
      full_name: string;
    };
    Seller: {
      id: number;
      full_name: string;
      paypalEmail: string;
      paypalAccountId: string;
    };
    MediaItem?: {
      id: number;
      name: string;
    };
    PlaylistItem?: {
      id: number;
      name: string;
    };
  }>;
}

const receiptColumns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Item Type',
    dataIndex: 'item_type',
    key: 'item_type',
  },
  {
    title: 'Item Name',
    dataIndex: 'item_name',
    key: 'item_name',
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    render: (price: string) => `$${(parseFloat(price) / 100).toFixed(2)}`,
  },
  {
    title: 'Tax',
    dataIndex: 'tax',
    key: 'tax',
    render: (tax: string) => `$${(parseFloat(tax) / 100).toFixed(2)}`,
  },
  {
    title: 'Earnings',
    dataIndex: 'total',
    key: 'total',
    render: (total: string) => `$${(parseFloat(total) / 100).toFixed(2)}`,
  },
  {
    title: 'Buyer',
    dataIndex: ['Buyer', 'full_name'],
    key: 'buyer',
  },
];

interface PaymentDetailsModalProps {
  id: number;
}

export default function PaymentDetailsModal({ id }: PaymentDetailsModalProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useAtomValue(tokenAtom);

  const showModal = () => {
    setIsModalVisible(true);
    fetchPaymentDetail();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const fetchPaymentDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:3001/payments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setPaymentDetail(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch payment details');
      }
    } catch (err) {
      setError('An error occurred while fetching payment details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    return dateString ? new Date(dateString).toLocaleString() : 'N/A';
  };

  const formatAmount = (amount: string) => {
    return `$${(parseFloat(amount) / 100).toFixed(2)}`;
  };

  return (
    <>
      <Button type="primary" onClick={showModal} icon={<EyeOutlined />}>
        View
      </Button>
      <Modal
        title={`Payment Details - ID: ${id}`}
        open={isModalVisible}
        onCancel={handleCancel}
        width={1000}
        footer={[
          <Button key="close" onClick={handleCancel}>
            Close
          </Button>
        ]}
      >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : paymentDetail ? (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Total Amount">{formatAmount(paymentDetail.totalAmount)}</Descriptions.Item>
              <Descriptions.Item label="Status">{paymentDetail.status}</Descriptions.Item>
              <Descriptions.Item label="Seller PayPal Email">{paymentDetail.receipts[0]?.Seller.paypalEmail || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Seller PayPal Account ID">{paymentDetail.receipts[0]?.Seller.paypalAccountId || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Requester">{paymentDetail.requester.full_name}</Descriptions.Item>
              <Descriptions.Item label="Approver">{paymentDetail.approver?.full_name || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Requested At">{formatDate(paymentDetail.requestedAt)}</Descriptions.Item>
              <Descriptions.Item label="Approved At">{formatDate(paymentDetail.approvedAt)}</Descriptions.Item>
              {/* <Descriptions.Item label="Completed At">{formatDate(paymentDetail.completedAt)}</Descriptions.Item> */}
              <Descriptions.Item label="Request Note">{paymentDetail.requestNote || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Approval Note">{paymentDetail.approvalNote || 'N/A'}</Descriptions.Item>
            </Descriptions>

            <Title level={4} style={{ marginTop: '20px', marginBottom: '10px' }}>Receipts</Title>
            <Table dataSource={paymentDetail.receipts} columns={receiptColumns} rowKey="id" />
          </>
        ) : null}
      </Modal>
    </>
  );
}