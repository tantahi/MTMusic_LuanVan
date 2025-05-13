import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Avatar, Typography, Spin, Row, Col, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface User {
  id: number;
  full_name: string;
  email: string;
  img_url: string | null;
  follower_count: number;
}

const TopFollowedUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/media/top/user');
        setUsers(response.data.data);
        setLoading(false);
      } catch (err) {
        message.error('Failed to fetch top users');
        setLoading(false);
      }
    };

    fetchTopUsers();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '300px',
        background: '#f0f2f5'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '15px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }}>
      <Title level={3} style={{
        textAlign: 'center',
        marginBottom: '24px',
        color: '#ffffff',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
      }}>
        Top Followed Users
      </Title>
      <Row gutter={[16, 16]} justify="center">
        {users.map((user) => (
          <Col key={user.id}>
            <Card
              hoverable
              style={{
                width: 200,
                borderRadius: '15px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease-in-out',
              }}
              bodyStyle={{
                padding: '20px',
                textAlign: 'center',
              }}
              onClick={() => window.location.href = `/home/artist/${user.id}`}
            >
              <div style={{
                marginBottom: '15px',
                display: 'flex',
                justifyContent: 'center',
              }}>
                <Avatar
                  size={120}
                  src={user.img_url ? `http://localhost:3001${user.img_url}` : undefined}
                  icon={!user.img_url && <UserOutlined />}
                  style={{
                    border: '4px solid #ffffff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
              <Title level={4} style={{ margin: '10px 0', fontSize: '18px' }}>
                {user.full_name}
              </Title>
              <p style={{
                margin: '5px 0',
                color: '#666',
                fontSize: '14px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {user.email}
              </p>
              <p style={{
                margin: '5px 0',
                fontWeight: 'bold',
                color: '#1890ff',
              }}>
                {user.follower_count} followers
              </p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default TopFollowedUsers;

