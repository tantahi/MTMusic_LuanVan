'use client';

import React, { useEffect, useState } from 'react';
import { Button, Space, Table, Tag, message, Spin, Input, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import adminService from '@/services/admin.service';
import { UserType } from '@/types';
import { getCookie } from '@/lib/utils';
import { format, isValid, parseISO, differenceInDays } from 'date-fns';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Search } = Input;

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = getCookie(document.cookie, 'token');

    if (!token) {
      setError('No authentication token found');
      message.error('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await adminService.getAllUsers(token);
      console.log('Fetched users:', data);
      data.forEach((user: UserType) => {
        console.log(`User ${user.id} - VIP Start: ${user.vip_start_date}, VIP End: ${user.vip_end_date}`);
      });
      setUsers(data);
      setFilteredUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      message.error(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(value.toLowerCase()) ||
      user.full_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const parseDateString = (dateString?: string) => {
    if (!dateString) return null;
    const parsedDate = parseISO(dateString);
    return isValid(parsedDate) ? parsedDate : null;
  };

  const renderDate = (dateString?: string) => {
    const date = parseDateString(dateString);
    if (!date) return 'N/A';
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  };

  const getVipStatus = (startDate?: string, endDate?: string) => {
    const start = parseDateString(startDate);
    const end = parseDateString(endDate);
    const now = new Date();

    if (!start || !end) return 'Not VIP';
    if (now < start) return 'VIP (Pending)';
    if (now > end) return 'VIP (Expired)';
    return 'VIP (Active)';
  };

  const columns: ColumnsType<UserType> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Admin', value: 'Admin' },
        { text: 'Staff', value: 'Staff' },
        { text: 'User', value: 'User' },
        { text: 'Vip User', value: 'Vip User' },
      ],
      onFilter: (value, record) => record.role.indexOf(value as string) === 0,
      sorter: (a, b) => a.role.localeCompare(b.role),
      render: (role) => {
        let color = role === 'Admin' ? 'red' : role === 'Staff' ? 'blue' : role === 'Vip User' ? 'gold' : 'green';
        return (
          <Tag color={color} key={role}>
            {role.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Inactive', value: 'Inactive' },
        { text: 'Banned', value: 'Banned' },
      ],
      onFilter: (value, record) => record.status?.indexOf(value as string) === 0,
      render: (status) => {
        let color = status === 'Active' ? 'green' : status === 'Banned' ? 'volcano' : 'geekblue';
        return (
          <Tag color={color} key={status}>
            {status?.toUpperCase() || 'N/A'}
          </Tag>
        );
      },
    },
    // {
    //   title: 'VIP Status',
    //   key: 'vip_status',
    //   render: (_, record) => {
    //     const status = getVipStatus(record.vip_start_date, record.vip_end_date);
    //     let color = status === 'VIP (Active)' ? 'gold' : status === 'VIP (Pending)' ? 'blue' : status === 'VIP (Expired)' ? 'volcano' : 'default';
    //     return (
    //       <Tag color={color}>
    //         {status}
    //       </Tag>
    //     );
    //   },
    //   filters: [
    //     { text: 'VIP (Active)', value: 'VIP (Active)' },
    //     { text: 'VIP (Pending)', value: 'VIP (Pending)' },
    //     { text: 'VIP (Expired)', value: 'VIP (Expired)' },
    //     { text: 'Not VIP', value: 'Not VIP' },
    //   ],
    //   onFilter: (value, record) => getVipStatus(record.vip_start_date, record.vip_end_date) === value,
    // },
    {
      title: 'VIP Start Date',
      dataIndex: 'vip_start_date',
      key: 'vip_start_date',
      sorter: (a, b) => {
        const dateA = parseDateString(a.vip_start_date);
        const dateB = parseDateString(b.vip_start_date);
        return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
      },
      render: (vip_start_date) => renderDate(vip_start_date),
    },
    {
      title: 'VIP End Date',
      dataIndex: 'vip_end_date',
      key: 'vip_end_date',
      sorter: (a, b) => {
        const dateA = parseDateString(a.vip_end_date);
        const dateB = parseDateString(b.vip_end_date);
        return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
      },
      render: (vip_end_date, record) => {
        const endDate = parseDateString(vip_end_date);
        const now = new Date();
        if (!endDate) return renderDate(vip_end_date);
        
        const daysLeft = differenceInDays(endDate, now);
        return (
          <Tooltip title={`${daysLeft} days left`}>
            <span>{renderDate(vip_end_date)} <InfoCircleOutlined /></span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Link href={`/admin/user/${record.id}`}>
            <Button type="primary">Edit</Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <Search
          placeholder="Search by email or full name"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Link href="/admin/user/create">
          <Button type="primary">Create User</Button>
        </Link>
      </div>
      {loading ? (
        <div className="text-center mt-12">
          <Spin size="large" />
        </div>
      ) : (
        <Table 
          columns={columns} 
          dataSource={filteredUsers} 
          rowKey="id"
          pagination={{ 
            pageSize: 10, 
            showSizeChanger: true, 
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
          }}
        />
      )}
      {error && (
        <div className="text-red-500 text-center mt-4">{error}</div>
      )}
    </div>
  );
};

export default UserTable;

