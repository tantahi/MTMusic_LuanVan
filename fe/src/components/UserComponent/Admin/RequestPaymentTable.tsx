'use client'

import React, { useState, useEffect } from 'react';
import { Table, message, Button, Modal, Select, Input, Space, Checkbox } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import axios from 'axios';
import PaymentDetailsModal from './PaymentDetailModal';
import { useAtomValue } from 'jotai'
import { userAtom, tokenAtom } from '@/lib/atom/user.atom'

interface Requester {
  id: number;
  full_name: string;
}

interface Payment {
  id: number;
  totalAmount: number | string;
  status: string;
  requestNote: string;
  requestedAt: string;
  totalReceipts: number;
  requester: Requester;
}

const { Option } = Select;

export default function RequestPaymentTable() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const token = useAtomValue(tokenAtom);

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    setSelectAll(selectedRowKeys.length === payments.length);
  }, [selectedRowKeys, payments]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ success: boolean; data: Payment[] }>('http://localhost:3001/payments/requested', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.data.length > 0) {
        setPayments(response.data.data);
      } else {
        // message.warning('No payment requests found.');
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      message.error('An error occurred while fetching payments. Please try again later.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async () => {
    if (selectedRowKeys.length === 0 || !newStatus) {
      message.error('Please select payments and a new status');
      return;
    }

    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      setLoading(true);
      const updatePromises = selectedRowKeys.map(id => 
        axios.put(`http://localhost:3001/payments/approve/${id}`, 
          { 
            status: newStatus, 
            approvalNote: newStatus === 'Rejected' ? rejectReason : undefined 
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
      );

      await Promise.all(updatePromises);

      await fetchPayments(); // Refresh the data after updating
      setSelectedRowKeys([]);
      setNewStatus('');
      setRejectReason('');
      message.success('Payment statuses updated successfully');
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating payment statuses:', error);
      message.error('Failed to update payment statuses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedRowKeys(checked ? payments.map(item => item.id) : []);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };

  const formatCurrency = (value: number): string => {
    const amount = value / 100; // Divide by 100 here
    return isNaN(amount) ? 'Invalid Amount' : `$${amount.toFixed(2)}`;
  };

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
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (value: number | string) => formatCurrency(value),
      sorter: (a, b) => {
        const aValue = typeof a.totalAmount === 'string' ? parseFloat(a.totalAmount) : a.totalAmount;
        const bValue = typeof b.totalAmount === 'string' ? parseFloat(b.totalAmount) : b.totalAmount;
        return aValue - bValue;
      },
    },
    {
      title: 'Total Receipts',
      dataIndex: 'totalReceipts',
      key: 'totalReceipts',
      sorter: (a, b) => a.totalReceipts - b.totalReceipts,
    },

    {
      title: 'Requested At',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      render: (value: string) => new Date(value).toLocaleString(),
      sorter: (a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <PaymentDetailsModal id={record.id}/>
        </Space>
      ),
    },
  ];

  const onChange: TableProps<Payment>['onChange'] = (pagination, filters, sorter, extra) => {
    console.log('Table parameters:', pagination, filters, sorter, extra);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <Checkbox
          checked={selectAll}
          onChange={(e) => handleSelectAll(e.target.checked)}
        >
          Select All
        </Checkbox>
        <Space>
          <Select
            style={{ width: 120 }}
            placeholder="Select new status"
            onChange={(value: string) => setNewStatus(value)}
            value={newStatus}
          >
            <Option value="Approved">Approved</Option>
            <Option value="Rejected">Rejected</Option>
            <Option value="Pending">Pending</Option>
          </Select>
          <Button 
            type="primary" 
            onClick={handleChangeStatus}
            disabled={selectedRowKeys.length === 0 || !newStatus}
          >
            Change Status ({selectedRowKeys.length})
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={payments}
        rowKey="id"
        loading={loading}
        onChange={onChange}
        pagination={{ pageSize: 10 }}
        rowSelection={rowSelection}
      />
      <Modal
        title="Change Payment Status"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      >
        <p>Are you sure you want to change the status of {selectedRowKeys.length} payment(s) to {newStatus}?</p>
        {newStatus === 'Rejected' && (
          <Input.TextArea
            placeholder="Reason for rejection"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            className="mt-4"
          />
        )}
      </Modal>
    </div>
  );
}

