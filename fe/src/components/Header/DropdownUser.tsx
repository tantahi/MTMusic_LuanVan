'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { tokenAtom, userAtom } from '@/lib/atom/user.atom'
import { useRouter } from 'next/navigation'
import { Avatar, Button, Space, Typography } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'

const { Text } = Typography

export default function DropdownUser() {
  const user = useAtomValue(userAtom)
  const token = useAtomValue(tokenAtom)
  const setUser = useSetAtom(userAtom)
  const setToken = useSetAtom(tokenAtom)
  const router = useRouter()

  if (!token || !user) {
    return null
  }

  const handleLogout = () => {
    setUser(null) // Clear the global user state
    setToken(null)
    router.push('/auth/signin')
  }

  return (
    <Space size="middle" align="center">
      <Space direction="vertical" size={0} className="hidden lg:block">
        <Text strong>{user.full_name}</Text>
        <Text type="secondary">{user.role}</Text>
      </Space>

      <Avatar
        size={48}
        src={`http://localhost:3001${user.img_url}`}
        alt={`${user.full_name}'s profile picture`}
      />

      <Button
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        type="text"
        aria-label="Log out"
      />
    </Space>
  )
}