'use client'

import React, { useEffect, useState } from 'react'
import { List, Avatar, Typography, Layout, Input, message } from 'antd'
import { MessageOutlined, SearchOutlined } from '@ant-design/icons'
import Link from 'next/link'
import axios from 'axios'
import { userAtom, tokenAtom } from '@/lib/atom/user.atom'
import { useAtomValue } from 'jotai'

const { Header, Content } = Layout
const { Title, Text } = Typography

interface ChatUser {
  id: number
  full_name: string
  img_url: string | null
  last_message: string
}

export default function ChatUserList() {
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const user = useAtomValue(userAtom)
  const token = useAtomValue(tokenAtom)

  useEffect(() => {
    if (user && token) {
      fetchChatUsers()
    }
  }, [user, token])

  const fetchChatUsers = async () => {
    if (!user || !token) return

    try {
      const response = await axios.get<{ data: ChatUser[] }>(
        `http://localhost:3001/chat/users/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setChatUsers(response.data.data)
    } catch (error) {
      console.error('Error fetching chat users:', error)
      message.error('Unable to load chat user list')
    }
  }

  const filteredUsers = [
    // {
    //   id: 1,
    //   full_name: 'Admin',
    //   img_url: null,
    //   last_message: 'Contact admin for support',
    // },
    ...chatUsers.filter(chatUser => 
      chatUser.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ]

  if (!user || !token) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Text>Please log in to view the chat list</Text>
        </Content>
      </Layout>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 16px', borderBottom: '1px solid #f0f0f0' }}>
        <Title level={2}>Chat</Title>
      </Header>
      <Content style={{ padding: '24px' }}>
        <Input
          placeholder="Search users"
          prefix={<SearchOutlined />}
          style={{ marginBottom: 16 }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <List
          itemLayout="horizontal"
          dataSource={filteredUsers}
          renderItem={(item) => (
            <List.Item>
              <Link href={`chat/${item.id}`} style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                <List.Item.Meta
                  avatar={
                    item.id === 1 ? (
                      <Avatar icon={<MessageOutlined />} />
                    ) : (
                      <Avatar
                        src={item.img_url ? `http://localhost:3001${item.img_url}` : undefined}
                        icon={!item.img_url && <Text>{item.full_name.charAt(0)}</Text>}
                      >
                        {!item.img_url && item.full_name.charAt(0)}
                      </Avatar>
                    )
                  }
                  title={<Text strong>{item.full_name}</Text>}
                  description={
                    <Text type="secondary" ellipsis={{ tooltip: item.last_message }}>
                      {item.last_message}
                    </Text>
                  }
                />
              </Link>
            </List.Item>
          )}
        />
      </Content>
    </Layout>
  )
}