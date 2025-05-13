'use client';

import React, { useEffect, useState } from 'react';
import { Button, Space, Table, Tag, message, Spin, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined } from '@ant-design/icons';
import { MediaType } from '@/types';
import mediaService from '@/services/media.service';
import { getCookie } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MediaDetailsModal from '@/components/UserComponent/Admin/MediaDetailModal'
const { Search } = Input;

const MediaTable: React.FC = () => {
  const [media, setMedia] = useState<MediaType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    const token = getCookie(document.cookie, 'token');

    if (!token) {
      setError('No authentication token found');
      message.error('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const mediaData = await mediaService.getAllMedia(token);
      setMedia(mediaData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch media');
      message.error(err.message || 'Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/media/${id}`);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
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
        { text: 'Reported', value: 'Reported' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Report Count',
      dataIndex: 'reports_count',
      key: 'reports_count',
      render: (count) => {
        let color = 'green';
        if (count > 10) {
          color = 'red';
        } else if (count > 5) {
          color = 'gold';
        }
        return (
          <Tag color={color} key={count}>
            {count}
          </Tag>
        );
      },
      sorter: (a, b) => (a.reports_count || 0) - (b.reports_count || 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record.id)}>
            Edit
          </Button>
          <MediaDetailsModal id={record.id}></MediaDetailsModal>
        </Space>
      ),
    },
  ];

  return (
    <div className="m-0 w-full p-4">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Search
            placeholder="Search by name, artist, author or price"
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Link href="/admin/media/create">
            <Button type="primary">Create Media</Button>
          </Link>
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
          />
        )}
        {error && (
          <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>
        )}
      </Space>
    </div>
  );
};

export default MediaTable;

