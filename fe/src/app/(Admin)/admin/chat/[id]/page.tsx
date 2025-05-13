'use client'

import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Input, Button, List, Avatar, Typography, Layout, message } from 'antd'
import { SendOutlined, CheckCircleFilled } from '@ant-design/icons'
import io from 'socket.io-client'
import { Socket } from 'socket.io-client'
import { userAtom, tokenAtom } from '@/lib/atom/user.atom'
import { useAtomValue } from 'jotai'
import { useParams } from 'next/navigation'

const { Header, Footer, Content } = Layout
const { Text } = Typography

interface User {
  id: number
  name: string
  avatar: string
}

interface Message {
  id: number
  sender_id: number
  receiver_id: number
  content: string
  sent_at: string | null
  status?: 'sent' | 'delivered' | 'read'
}

interface ConversationResponse {
  sender: User
  receiver: User
  messages: Message[]
}

const socket = io('http://localhost:3001'); // Connect to the server

export default function ChatPage() {
  const params = useParams()
  const receiverId = Number(params.id)
  const user = useAtomValue(userAtom)
  const token = useAtomValue(tokenAtom)
  const senderId = user?.id

  const [conversation, setConversation] = useState<ConversationResponse | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (senderId && receiverId) {
      fetchMessages()

      socket.on('receiveMessage', (newMessage: Message) => {
        setConversation(prev => prev ? {
          ...prev,
          messages: [...prev.messages, newMessage]
        } : null)
      })
    }

    return () => {
      socket.off('receiveMessage')
    }
  }, [senderId, receiverId])

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    try {
      const response = await axios.get<{ data: ConversationResponse }>(
        `http://localhost:3001/chat/conversation/${senderId}/${receiverId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setConversation(response.data.data)
    } catch (error) {
      console.error('Error fetching conversation:', error)
      message.error('Unable to fetch conversation')
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !senderId) return

    try {
      const response = await axios.post(
        'http://localhost:3001/chat/send',
        {
          sender_id: senderId,
          receiver_id: receiverId,
          content: newMessage,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      setNewMessage('')
      message.success('Message sent successfully')
    } catch (error) {
      console.error('Error sending message:', error)
      message.error('Unable to send message')
    }
  }

  if (!senderId || !receiverId || !conversation) {
    return <div>Loading...</div>
  }

  return (
    <Layout style={{ height: '70vh' }}>
      <Header style={{ background: '#fff', padding: '8px 8px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={`http://localhost:3001${conversation.receiver.avatar}`} />
          <Typography.Title level={4} style={{ margin: '0 0 0 16px' }}>
            Chat with {conversation.receiver.name}
          </Typography.Title>
        </div>
      </Header>
      <Content style={{ padding: '24px', overflowY: 'auto' }}>
        <List
          dataSource={conversation.messages}
          renderItem={(msg) => (
            <List.Item style={{ justifyContent: msg.sender_id === senderId ? 'flex-end' : 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: msg.sender_id === senderId ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                <Avatar src={`http://localhost:3001${msg.sender_id === senderId ? conversation.sender.avatar : conversation.receiver.avatar}`} />
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    background: msg.sender_id === senderId ? '#1890ff' : '#f0f0f0',
                    color: msg.sender_id === senderId ? '#fff' : 'rgba(0, 0, 0, 0.85)',
                    marginLeft: msg.sender_id === senderId ? '0' : '8px',
                    marginRight: msg.sender_id === senderId ? '8px' : '0',
                  }}
                >
                  <Text>{msg.content}</Text>
                  <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary" style={{ fontSize: '12px', color: msg.sender_id === senderId ? 'rgba(255, 255, 255, 0.75)' : '' }}>
                      {msg.sent_at ? new Date(msg.sent_at).toLocaleTimeString() : 'Sending...'}
                    </Text>
                    {msg.sender_id === senderId && msg.status && (
                      <CheckCircleFilled style={{ 
                        fontSize: '14px', 
                        color: msg.status === 'read' ? '#52c41a' : msg.status === 'delivered' ? '#1890ff' : 'rgba(255, 255, 255, 0.45)' 
                      }} />
                    )}
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </Content>
      <Footer style={{ padding: '16px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
        <Input.Group compact>
          <Input
            style={{ width: 'calc(100% - 100px)' }}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Enter your message..."
            onPressEnter={sendMessage}
          />
          <Button type="primary" onClick={sendMessage} icon={<SendOutlined />}>
            Send
          </Button>
        </Input.Group>
      </Footer>
    </Layout>
  )
}

