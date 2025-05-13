'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  message,
  Space,
} from 'antd';
import moment from 'moment';
import adminService from '@services/admin.service'; // Đảm bảo đường dẫn chính xác
import { UserType } from '@/types';
import { getCookie, handleError } from '@/lib/utils'; // Import getCookie và handleError từ utils

// Định nghĩa một kiểu mới để xử lý trạng thái của người dùng trong component
interface UserFormValues extends Omit<UserType, 'birthday'> {
  birthday: moment.Moment | null;
}

const UserForm: React.FC<{ userId: number }> = ({ userId }) => {
  const [form] = Form.useForm();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const token = getCookie(document.cookie, 'token'); // Lấy token từ cookie

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      try {
        const response = await adminService.getUserById(userId, token); // Thêm token vào API call
        const fetchedUser = response;
        console.log(fetchedUser)

        // Cập nhật user với giá trị null hoặc mặc định nếu dữ liệu từ server không có
        setUser(fetchedUser);

        form.setFieldsValue({
          ...fetchedUser,
          birthday: fetchedUser.birthday ? moment(fetchedUser.birthday) : null, // Convert birthday nếu không null
          address: fetchedUser.address || 'N/A', // Nếu address là null, hiển thị 'N/A'
          vip_start_date: fetchedUser.vip_start_date
            ? moment(fetchedUser.vip_start_date)
            : null,
          vip_end_date: fetchedUser.vip_end_date
            ? moment(fetchedUser.vip_end_date)
            : null,
        });
      } catch (error: any) {
        console.error(error);
        handleError(error); // Sử dụng handleError để xử lý lỗi
      }
    };

    fetchUser();
  }, [userId, token]); // Đảm bảo token có trước khi thực hiện

  const handleSave = async (values: any) => {
    if (!token) {
      message.error('No authentication token found');
      return;
    }

    try {
      if (!user) {
        throw new Error('User data is not available');
      }

      setLoading(true);

      await adminService.updateUser(
        user.id,
        {
          ...values,
          birthday: values.birthday
            ? values.birthday.format('YYYY-MM-DD')
            : null, // Convert moment to string cho backend, trả về null nếu không có
          vip_start_date: values.vip_start_date
            ? values.vip_start_date.format('YYYY-MM-DD')
            : null,
          vip_end_date: values.vip_end_date
            ? values.vip_end_date.format('YYYY-MM-DD')
            : null,
        },
        token
      ); // Thêm token vào API call

      message.success('User details saved successfully!');
    } catch (error: any) {
      handleError(error); // Sử dụng handleError để xử lý lỗi
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!token) {
      message.error('No authentication token found');
      return;
    }

    try {
      if (!user) {
        throw new Error('User data is not available');
      }

      setLoading(true);

      await adminService.deleteUser(user.id, token); // Thêm token vào API call
      message.success('User deleted successfully');
      // Redirect or clear form if necessary
    } catch (error: any) {
      handleError(error); // Sử dụng handleError để xử lý lỗi
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-0 w-full p-4">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          ...user,
          birthday: user?.birthday ? moment(user.birthday) : null, // Convert birthday to moment nếu có, null nếu không có
          address: user?.address || 'N/A', // Hiển thị N/A nếu address là null
          vip_start_date: user?.vip_start_date
            ? moment(user.vip_start_date)
            : null,
          vip_end_date: user?.vip_end_date ? moment(user.vip_end_date) : null,
        }}
        onFinish={handleSave}
      >
        <Row gutter={16}>
          {/* Left Column */}
          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, type: 'email' }]}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              label="Full Name"
              name="full_name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Birthday" name="birthday">
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item label="Address" name="address">
              <Input />
            </Form.Item>
          </Col>

          {/* Right Column */}
          <Col span={12}>
            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true }]}
              className="role-select"
            >
              <Select style={{ fontWeight: 'bold' }}>
                <Select.Option value="Admin">Admin</Select.Option>
                <Select.Option value="Staff">Staff</Select.Option>
                <Select.Option value="User">User</Select.Option>
                <Select.Option value="Vip User">Vip User</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true }]}
              className="status-select"
            >
              <Select style={{ fontWeight: 'bold' }}>
                <Select.Option value="Active">Active</Select.Option>
                <Select.Option value="Inactive">Inactive</Select.Option>
                <Select.Option value="Banned">Banned</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="VIP Start Date" name="vip_start_date">
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item label="VIP End Date" name="vip_end_date">
              <DatePicker className="w-full" />
            </Form.Item>

            {/* <Form.Item label="Report Count" name="report_count">
              <InputNumber min={0} className="w-full" />
            </Form.Item> */}
          </Col>
        </Row>

        <Form.Item>
          <Space size="middle">
            <Button type="primary" htmlType="submit" loading={loading}>
              Save
            </Button>
            <Button
              type="default"
              danger
              onClick={handleDelete}
              loading={loading}
            >
              Delete
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UserForm;
