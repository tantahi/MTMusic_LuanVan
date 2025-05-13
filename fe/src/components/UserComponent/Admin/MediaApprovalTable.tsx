'use client';

import React, { useEffect, useState } from 'react';
import { Button, Space, Table, Tag, message, Spin, Input, Modal, Select, Checkbox } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined } from '@ant-design/icons';
import { MediaType } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAtomValue } from 'jotai';
import { userAtom, tokenAtom } from '@/lib/atom/user.atom';
import MediaDetailsModal from './MediaDetailModal';

const { Search } = Input;
const { Option } = Select;

export default function MediaApprovalTable() {
  const [media, setMedia] = useState<MediaType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaType | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<string>('');
  const [approvalNote, setApprovalNote] = useState<string>('');
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkApprovalStatus, setBulkApprovalStatus] = useState<string>('');
  const [isBulkModalVisible, setIsBulkModalVisible] = useState(false);
  const router = useRouter();
  const token = useAtomValue(tokenAtom);
  const user = useAtomValue(userAtom);

  useEffect(() => {
    if (token) {
      setTokenLoaded(true);
    }
  }, [token]);

  useEffect(() => {
    if (tokenLoaded) {
      fetchMedia();
    }
  }, [tokenLoaded]);

  useEffect(() => {
    setSelectAll(selectedRowKeys.length === media.length);
  }, [selectedRowKeys, media]);

  const fetchMedia = async () => {
    if (!token) {
      setError('No authentication token found');
      message.error('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/media/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setMedia(response.data.data);
      } else {
        console.error('Received invalid data format:', response.data);
        setMedia([]);
        setError('Received invalid data format');
      }
    } catch (err: any) {
      console.error('Error fetching media:', err);
      setError(err.message || 'Failed to fetch media');
      message.error(err.message || 'Failed to fetch media');
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const showApprovalModal = (record: MediaType) => {
    setSelectedMedia(record);
    setApprovalStatus(record.status || 'Pending');
    setApprovalNote('');
    setIsModalVisible(true);
  };

  const handleApproval = async () => {
    if (!selectedMedia || !token) return;

    try {
      await axios.post(`http://localhost:3001/media/approval/${selectedMedia.id}`, {
        status: approvalStatus,
        approvalNote: approvalNote
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      message.success('Media status updated successfully');
      setIsModalVisible(false);
      fetchMedia();
    } catch (error) {
      console.error('Error updating media status:', error);
      message.error('Failed to update media status');
    }
  };

  const handleBulkApproval = async () => {
    if (selectedRowKeys.length === 0 || !bulkApprovalStatus || !token) return;

    try {
      setLoading(true);
      for (const id of selectedRowKeys) {
        await axios.post(`http://localhost:3001/media/approval/${id}`, {
          status: bulkApprovalStatus,
          approvalNote: ''
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      message.success('Media statuses updated successfully');
      setIsBulkModalVisible(false);
      fetchMedia();
    } catch (error) {
      console.error('Error updating media statuses:', error);
      message.error('Failed to update media statuses');
    } finally {
      setLoading(false);
      setSelectedRowKeys([]);
      setBulkApprovalStatus('');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedRowKeys(checked ? media.map(item => item.id) : []);
  };

  const filteredMedia = media.filter(item => 
    (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') || 
    (item.artist_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    (item.creator?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    (item.price?.toString().includes(searchTerm) || '')
  );

  const columns: ColumnsType<MediaType> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: 'Artist',
      dataIndex: 'artist_name',
      key: 'artist_name',
      sorter: (a, b) => (a.artist_name || '').localeCompare(b.artist_name || ''),
    },
    {
      title: 'Author',
      dataIndex: ['creator', 'full_name'],
      key: 'author',
      sorter: (a, b) => (a.creator?.full_name || '').localeCompare(b.creator?.full_name || ''),
    },
    {
      title: 'Type',
      dataIndex: 'media_type',
      key: 'media_type',
      filters: [
        { text: 'Song', value: 'Song' },
        { text: 'Podcast', value: 'Podcast' },
      ],
      onFilter: (value, record) => record.media_type === value,
    },
    {
      title: 'Genre',
      dataIndex: 'genre',
      key: 'genre',
      filters: [
        { text: 'Pop', value: 'Pop' },
        { text: 'Rap', value: 'Rap' },
        { text: 'Jazz', value: 'Jazz' },
        { text: 'Classical', value: 'Classical' },
      ],
      onFilter: (value, record) => record.genre === value,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => {
        const priceA = a.price ? parseFloat(a.price) : 0;
        const priceB = b.price ? parseFloat(b.price) : 0;
        return priceA - priceB;
      },
      render: (price) => {
        if (!price || price === '0.00') {
          return 'Free';
        }
        const priceInUSD = (parseFloat(price) / 100).toFixed(2);
        return `$${priceInUSD}`;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = status === 'Approved' ? 'green' :
            status === 'Rejected' ? 'red' :
            status === 'Reported' ? 'orange' : 'gold';
        return (
          <Tag color={color} key={status}>
            {status?.toUpperCase() || 'N/A'}
          </Tag>
        );
      },
      filters: [
        { text: 'Approved', value: 'Approved' },
        { text: 'Pending', value: 'Pending' },
        { text: 'Rejected', value: 'Rejected' },
        // { text: 'Reported', value: 'Reported' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <MediaDetailsModal id={record.id} />
          {(user.role === 'Admin' || user.role === 'Staff') && (
            <Button icon={<EditOutlined />} onClick={() => showApprovalModal(record)}>
              Edit Status
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };

  if (!tokenLoaded) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="m-0 w-full p-4">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Search
            placeholder="Search by name, artist, author or price"
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Space>
            {(user.role === 'Admin' || user.role === 'Staff') && (
              <>
                <Checkbox
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                >
                  Select All
                </Checkbox>
                <Select
                  style={{ width: 120 }}
                  placeholder="Select status"
                  onChange={(value: string) => setBulkApprovalStatus(value)}
                  value={bulkApprovalStatus}
                >
                  <Option value="Approved">Approve</Option>
                  <Option value="Rejected">Reject</Option>
                  <Option value="Pending">Pending</Option>
                  {/* <Option value="Reported">Reported</Option> */}
                </Select>
                <Button 
                  type="primary" 
                  onClick={() => setIsBulkModalVisible(true)}
                  disabled={selectedRowKeys.length === 0 || !bulkApprovalStatus}
                >
                  Change Status ({selectedRowKeys.length})
                </Button>
              </>
            )}
            <Link href="/admin/media/create">
              <Button type="primary">Create Media</Button>
            </Link>
          </Space>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table 
            columns={columns} 
            dataSource={filteredMedia} 
            rowKey="id"
            rowSelection={rowSelection}
          />
        )}
        {error && (
          <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>
        )}
      </Space>
      <Modal
        title="Edit Media Status"
        open={isModalVisible}
        onOk={handleApproval}
        onCancel={() => setIsModalVisible(false)}
      >
        <Select
          style={{ width: '100%', marginBottom: '1rem' }}
          value={approvalStatus}
          onChange={(value) => setApprovalStatus(value)}
        >
          <Option value="Approved">Approve</Option>
          <Option value="Rejected">Reject</Option>
          <Option value="Pending">Pending</Option>
          {/* <Option value="Reported">Reported</Option> */}
        </Select>
        {approvalStatus === 'Rejected' && (
          <Input.TextArea
            placeholder="Enter rejection reason"
            value={approvalNote}
            onChange={(e) => setApprovalNote(e.target.value)}
            rows={4}
          />
        )}
      </Modal>
      <Modal
        title="Bulk Change Media Status"
        open={isBulkModalVisible}
        onOk={handleBulkApproval}
        onCancel={() => setIsBulkModalVisible(false)}
      >
        <p>Are you sure you want to change the status of {selectedRowKeys.length} media item(s) to {bulkApprovalStatus}?</p>
      </Modal>
    </div>
  );
}