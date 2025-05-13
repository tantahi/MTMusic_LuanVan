'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Table, Typography, Statistic, Row, Col, Avatar, Alert, Spin, Tag } from 'antd';
import { UserOutlined, DollarOutlined, SoundOutlined, CalendarOutlined } from '@ant-design/icons';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Link from 'next/link';
const { Title, Text } = Typography;

interface MediaItem {
  id: number;
  name: string;
  price: string;
  sales_count: string;
  likes_count: string;
  comments_count?: string;
  report_count: string;
}

interface UserData {
  id: number;
  email: string;
  full_name: string;
  img_url: string;
  status: string;
  report_count: number | null;
  vip_start_date: string;
  vip_end_date: string;
  role: 'Admin' | 'Staff' | 'User' | 'Vip User';
  songs: MediaItem[];
  podcasts: MediaItem[];
  totalEarnings: number;
}

export default function UserProfile({ params }: { params: { id: number } }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, [params.id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ data: UserData }>(`http://localhost:3001/users/vip-user/${params.id}`);
      if (response.data && response.data.data) {
        setUserData(response.data.data);
      } else {
        throw new Error('Invalid data received from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching user data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-6">
        <Alert
          message="No Data"
          description="User data is not available."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  const mediaColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: MediaItem) => (
        <Link href={`/admin/media/${record.id}`}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: string) => `$${(parseFloat(price) / 100).toFixed(2)}`,
    },
    {
      title: 'Sales Count',
      dataIndex: 'sales_count',
      key: 'sales_count',
    },
    {
      title: 'Likes Count',
      dataIndex: 'likes_count',
      key: 'likes_count',
    },
    {
      title: 'Comments Count',
      dataIndex: 'comments_count',
      key: 'comments_count',
    },
    {
      title: 'Report Count',
      dataIndex: 'report_count',
      key: 'report_count',
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'red';
      case 'Staff':
        return 'blue';
      case 'Vip User':
        return 'gold';
      default:
        return 'default';
    }
  };

  return (
    <DefaultLayout>
      <div className="p-2">
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8} md={6} lg={4}>
              <Avatar 
                size={100} 
                icon={<UserOutlined />} 
                src={userData.img_url ? `http://localhost:3001${userData.img_url}` : undefined}
              />
            </Col>
            <Col xs={24} sm={16} md={18} lg={20}>
              <Title level={2}>{userData.full_name}</Title>
              <Text type="secondary">{userData.email}</Text>
              <br />
              <Text strong>Status: </Text>
              <Text>{userData.status}</Text>
              <br />
              <Text strong>Role: </Text>
              <Tag color={getRoleColor(userData.role)}>{userData.role}</Tag>
              {userData.report_count !== null && (
                <>
                  <br />
                  <Text strong>Report Count: </Text>
                  <Text>{userData.report_count}</Text>
                </>
              )}
              {userData.role === 'Vip User' && (
                <>
                  <br />
                  <Text strong>VIP Period: </Text>
                  <Text>
                    <CalendarOutlined /> {new Date(userData.vip_start_date).toLocaleDateString()} - {new Date(userData.vip_end_date).toLocaleDateString()}
                  </Text>
                </>
              )}
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="Total Earnings"
                value={userData.totalEarnings / 100}
                prefix={<DollarOutlined />}
                precision={2}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="Songs"
                value={userData.songs.length}
                prefix={<SoundOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Title level={3} className="mt-6">Songs</Title>
        <Table dataSource={userData.songs} columns={mediaColumns} rowKey="id" />

        <Title level={3} className="mt-6">Podcasts</Title>
        <Table dataSource={userData.podcasts} columns={mediaColumns} rowKey="id" />
      </div>
    </DefaultLayout>
  );
}

