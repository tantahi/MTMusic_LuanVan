'use client'

import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, List } from 'antd';
import { UserOutlined, DollarOutlined, PlayCircleOutlined, CommentOutlined } from '@ant-design/icons';

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: {},
    payments: {},
    media: {},
    interactions: {},
    recentActivity: {}
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, payments, media, interactions, activity] = await Promise.all([
          fetch('http://localhost:3001/api/dashboard/user-stats').then(res => res.json()),
          fetch('http://localhost:3001/api/dashboard/payment-stats').then(res => res.json()),
          fetch('http://localhost:3001/api/dashboard/media-stats').then(res => res.json()),
          fetch('http://localhost:3001/api/dashboard/interaction-stats').then(res => res.json()),
          fetch('http://localhost:3001/api/dashboard/recent-activity').then(res => res.json())
        ]);

        setStats({
          users: users.data,
          payments: payments.data,
          media: media.data,
          interactions: interactions.data,
          recentActivity: activity.data
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  const { users, payments, media, interactions, recentActivity } = stats;

  return (
    <div style={{ padding: '24px' }}>
      <h1>Dashboard</h1>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={users.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={payments.totalRevenue/100}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Media"
              value={media.totalMedia}
              prefix={<PlayCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Comments"
              value={interactions.totalComments}
              prefix={<CommentOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={12}>
          <Card title="Requested Payments">
            <Table
              dataSource={recentActivity.recentPayments}
              columns={[
                {
                  title: 'User',
                  dataIndex: ['requester', 'full_name'],
                  key: 'user',
                },
                {
                  title: 'Amount',
                  dataIndex: 'totalAmount',
                  key: 'amount',
                  render: (amount: number) => `$${(amount / 100).toFixed(2)}`,
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                },
              ]}
              pagination={false}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Recent Media Uploads">
            <List
              dataSource={recentActivity.recentMedia}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.name}
                    description={`Type: ${item.media_type}, Uploaded: ${new Date(item.created_at).toLocaleDateString()}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

