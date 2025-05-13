'use client';

import { Form, Input, Button, DatePicker, Select, Tabs, Card, Typography, Row, Col, message, Upload, Radio } from 'antd';
import { UserOutlined, LockOutlined, CalendarOutlined, UploadOutlined, CreditCardOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { UpdateUserInfoRequest, ChangePasswordRequest, UserType, UpdatePaymentInfoRequest } from '@/types';
import authService from '@/services/auth.service';
import { userAtom, tokenAtom } from '@/lib/atom/user.atom';
import { useSetAtom, useAtomValue } from 'jotai';
import axios from 'axios';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function UserProfile() {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('profile');
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);
  const token = useAtomValue(tokenAtom);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [paymentOption, setPaymentOption] = useState('paypalAccountId');

  useEffect(() => {
    if (user) {
      setAvatarUrl('http://localhost:3001' + user?.img_url)
      form.setFieldsValue({
        ...user,
        birthday: user?.birthday ? moment(user.birthday) : null,
        paypalAccountId: user?.paypalAccountId || 'user.paypalAccountIdAttachment',
        paypalEmail: user?.paypalEmail || 'user.paypaiEmail',
      });
      setPaymentOption(user?.paypalAccountId ? 'paypalAccountId' : 'paypalEmail');
    }
  }, [user, form]);

  const updatePaymentInfo = async (paymentInfo: UpdatePaymentInfoRequest) => {
    try {
      const response = await axios.post('http://localhost:3001/auth/update-payment', paymentInfo, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(user)
      return response.data;
    } catch (error) {
      console.error('Error updating payment info:', error);
      throw error;
    }
  };

  const onFinish = async (values: any) => {
    if (!user) return;

    try {
      if (activeTab === 'profile') {
        const updateRequest: UpdateUserInfoRequest = {
          full_name: values.full_name,
          email: values.email,
          birthday: values.birthday ? values.birthday.toDate() : null,
          address: values.address,
          role: values.role,
          status: values.status,
        };
        await authService.updateUserInfo(user.id, updateRequest, token);
        message.success('Profile updated successfully');

        const updatedUser = { ...user, ...updateRequest };
        setUser(updatedUser);
      } else if (activeTab === 'password') {
        const changePasswordRequest: ChangePasswordRequest = {
          current_password: values.current_password,
          new_password: values.new_password,
        };
        await authService.changePassword(user.id, changePasswordRequest, token);
        message.success('Password changed successfully');
      } else if (activeTab === 'payment') {
        const updatePaymentRequest: UpdatePaymentInfoRequest = {
          paypalAccountId: paymentOption === 'paypalAccountId' ? values.paypalAccountId : undefined,
          paypalEmail: paymentOption === 'paypalEmail' ? values.paypalEmail : undefined,
        };
        const response = await updatePaymentInfo(updatePaymentRequest);
        if (response.status === 'success') {
          message.success(response.message);
          const updatedUser = { ...user, ...response.data };
          setUser(updatedUser);
        } else {
          message.error(response.message || 'Failed to update payment information');
        }
      }
    } catch (error) {
      console.error('Error updating user:', error);
      message.error('Failed to update user information');
    }
  };

  const handleAvatarChange = async (info: any) => {
    if (!token) {
      message.error('No authentication token found');
      return null;
    }
    const { file } = info;

    if (file.status === 'uploading') {
      return;
    }

    if (file.status === 'done') {
      try {
        const formData = new FormData();
        formData.append('img_url', file.originFileObj);

        const response = await authService.ChangeAvatar(formData, token);
        if (response.success) {
          setAvatarUrl('http://localhost:3001' + response.img_url);
          message.success('Avatar changed successfully');

          const data = await authService.getMe(token)
          setUser(data.user)
        } else {
          message.error('Failed to change avatar');
        }
      } catch (error) {
        console.error('Error changing avatar:', error);
        message.error('Failed to change avatar');
      }
    } else if (file.status === 'error') {
      message.error(`${file.name} file upload failed.`);
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    return date ? moment(date).format('YYYY-MM-DD') : 'N/A';
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const isVipUser = user.role === 'Vip User' || user.vip_start_date !== null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={2}>User Profile</Title>
        <Text type="secondary">Manage your account settings and preferences.</Text>
        <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginTop: '24px' }}>
          <TabPane tab={<span><UserOutlined />Profile</span>} key="profile">
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={16} align="middle" justify="center" style={{ marginBottom: '24px' }}>
                <Col>
                  <div className='flex flex-col items-center' style={{ textAlign: 'center' }}>
                    {avatarUrl && (
                      <img
                        src={avatarUrl}
                        alt="User Avatar"
                        style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '16px' }}
                      />
                    )}
                    <Upload
                      name="img_url"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                        if (!isJpgOrPng) {
                          message.error('You can only upload JPG/PNG file!');
                        }
                        const isLt2M = file.size / 1024 / 1024 < 2;
                        if (!isLt2M) {
                          message.error('Image must smaller than 2MB!');
                        }
                        return isJpgOrPng && isLt2M;
                      }}
                      onChange={handleAvatarChange}
                    >
                      <Button icon={<UploadOutlined />}>Change Avatar</Button>
                    </Upload>
                  </div>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="full_name" label="Full Name" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="birthday" label="Birthday">
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="address" label="Address">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="role" label="Role">
                    <Select disabled>
                      <Select.Option value="Admin">Admin</Select.Option>
                      <Select.Option value="Staff">Staff</Select.Option>
                      <Select.Option value="User">User</Select.Option>
                      <Select.Option value="Vip User">VIP User</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="status" label="Status">
                    <Select disabled>
                      <Select.Option value="Active">Active</Select.Option>
                      <Select.Option value="Inactive">Inactive</Select.Option>
                      <Select.Option value="Banned">Banned</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab={<span><LockOutlined />Password</span>} key="password">
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="current_password"
                label="Current Password"
                rules={[{ required: true, message: 'Please input your current password!' }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                name="new_password"
                label="New Password"
                rules={[{ required: true, message: 'Please input your new password!' }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                name="confirm_password"
                label="Confirm New Password"
                dependencies={['new_password']}
                rules={[
                  { required: true, message: 'Please confirm your new password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('new_password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Change Password
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab={<span><CalendarOutlined />VIP Status</span>} key="subscription">
            <Form layout="vertical">
              <Form.Item label="VIP Status">
                <Input value={user?.role === 'Vip User' ? 'Active' : 'Inactive'} readOnly />
              </Form.Item>
              <Form.Item label="VIP Start Date">
                <Input value={formatDate(user?.vip_start_date)} readOnly />
              </Form.Item>
              <Form.Item label="VIP End Date">
                <Input value={formatDate(user?.vip_end_date)} readOnly />
              </Form.Item>
            </Form>
          </TabPane>
          {isVipUser && (
            <TabPane tab={<span><CreditCardOutlined />Payment</span>} key="payment">
              <Form layout="vertical" onFinish={onFinish}>
                <Form.Item name="paymentOption" label="Payment Information">
                  <Radio.Group onChange={(e) => setPaymentOption(e.target.value)} value={paymentOption}>
                    <Radio value="paypalAccountId">PayPal Account ID</Radio>
                    <Radio value="paypalEmail">PayPal Email</Radio>
                  </Radio.Group>
                </Form.Item>
                {paymentOption == 'paypalAccountId' && (
                  <Form.Item
                    name="paypalAccountId"
                    label="PayPal Account ID"
                    initialValue={user.paypalAccountId}
                    rules={[{ required: true, message: 'Please input your PayPal Account ID!' }]}
                  >
                    <Input />
                  </Form.Item>
                )}
                {paymentOption == 'paypalEmail' && (
                  <Form.Item
                    name="paypalEmail"
                    label="PayPal Email"
                    initialValue={user.paypalEmail}
                    rules={[
                      { required: true, message: 'Please input your PayPal Email!' },
                      { type: 'email', message: 'Please enter a valid email!' }
                    ]}
                  >
                    <Input />
                  </Form.Item>
                )}
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Update Payment Information
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          )}
        </Tabs>
      </Card>
    </div>
  );
}