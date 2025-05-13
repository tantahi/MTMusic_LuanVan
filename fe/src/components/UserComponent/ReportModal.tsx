'use client'

import React from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { userAtom, tokenAtom } from '@/lib/atom/user.atom'
import { useAtomValue } from 'jotai'
import axios from 'axios';

const { TextArea } = Input;

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  postId: number;
  userId: number | undefined;
}

interface Report {
  id: number;
  post_id: number;
  user_id: number;
  report_type: 'Spam' | 'Inappropriate Content' | 'Copyright Violation' | 'Other';
  description: string;
  processed_by: number | null;
  status: 'Pending' | 'Rejected' | 'Accepted';
  created_at: string;
}

export default function ReportModal({ visible, onClose, postId, userId }: ReportModalProps) {
  const [form] = Form.useForm();
  const token = useAtomValue(tokenAtom);

  const handleCancel = () => {
    onClose();
    form.resetFields();
  };

  const onFinish = async (values: Partial<Report>) => {
    try {
      const response = await axios.post('http://localhost:3001/reports', {
        ...values,
        post_id: postId,
        user_id: userId,
        status: 'Pending',
        created_at: new Date().toISOString(),
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        message.success('Report submitted successfully');
        onClose();
        form.resetFields();
      } else {
        throw new Error(response.data.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message === 'You have already reported this post') {
          message.error('You have already reported this post.');
        } else {
          message.error(errorData.message || 'Failed to submit report. Please try again.');
        }
      } else {
        message.error('Failed to submit report. Please try again.');
      }
    }
  };

  return (
    <Modal
      title="Report Post"
      open={visible}
      onCancel={handleCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ report_type: 'Spam' }}
      >
        <Form.Item
          name="report_type"
          label="Report Type"
          rules={[{ required: true, message: 'Please select a report type' }]}
        >
          <Select>
            <Select.Option value="Spam">Spam</Select.Option>
            <Select.Option value="Inappropriate Content">Inappropriate Content</Select.Option>
            <Select.Option value="Copyright Violation">Copyright Violation</Select.Option>
            <Select.Option value="Other">Other</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please provide a description' }]}
        >
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit Report
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}