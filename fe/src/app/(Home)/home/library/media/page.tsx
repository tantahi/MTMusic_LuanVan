'use client'

import React, { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { userAtom, tokenAtom } from '@/lib/atom/user.atom';
import axios from 'axios';
import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  message,
  Row,
  Col,
  Typography,
  Card,
  InputNumber,
  Space,
  Spin,
  Tooltip,
  Switch,
  Radio
} from 'antd';
import { UploadOutlined, UserOutlined, AudioOutlined, FileTextOutlined, PictureOutlined, DollarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { MediaType } from '@/types';
import { useRouter } from 'next/navigation';
import TrackList from '@/components/TrackList';
import { usePlayerStore } from '@/hooks/usePlayer';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const MediaCreationForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [imgFile, setImgFile] = useState<UploadFile | null>(null);
  const [audioFile, setAudioFile] = useState<UploadFile | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [isMonetized, setIsMonetized] = useState(false);
  const [transcriptionLanguage, setTranscriptionLanguage] = useState<'en' | 'vi'>('en');
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const token = useAtomValue(tokenAtom);

  useEffect(() => {
    if (user && user.id) {
      setUserLoaded(true);
    }
  }, [user]);

  const handleImgChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setImgFile(fileList[0]);
  };

  const handleAudioChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setAudioFile(fileList[0]);
  };

  const transcribeAudio = async () => {
    if (!audioFile) {
      message.error('Please select an audio file first');
      return;
    }

    setTranscribing(true);
    const formData = new FormData();
    formData.append('audio', audioFile.originFileObj as File);

    try {
      const endpoint = transcriptionLanguage === 'en' 
        ? 'http://localhost:3001/media/transcribe' 
        : 'http://localhost:3001/media/transcribe/vi';
      
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      form.setFieldsValue({ lyric: response.data.lyrics });
      message.success('Transcription completed');
    } catch (err) {
      console.error('Error transcribing audio:', err);
      message.error('Failed to transcribe the audio');
    } finally {
      setTranscribing(false);
    }
  };

  const onFinish = async (values: MediaType) => {
    if (!token) {
      message.error('No authentication token found');
      return;
    }

    if (!imgFile || !audioFile) {
      message.error('Please select both an image and an audio file.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('img_url', imgFile.originFileObj as File);
      formData.append('audio_url', audioFile.originFileObj as File);
      formData.append('media_type', 'Song'); // Set default media type to 'Song'
      formData.append('is_monetized', isMonetized.toString());

      if (values.price) {
        // Convert price to cents
        const priceInCents = Math.round(values.price * 100);
        formData.append('price', priceInCents.toString());
      } else {
        formData.append('price', '0');
      }

      Object.keys(values).forEach(key => {
        if (key !== 'price' && values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      const response = await fetch('http://localhost:3001/media/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        message.success('Media created successfully');
        

        form.resetFields();
        setImgFile(null);
        setAudioFile(null);
        setIsMonetized(false);
        
        // Revalidate the path and navigate to home/library
        await fetch('/api/revalidate?path=/home/library');
        router.push('/home/library');
      } else {
        throw new Error('Failed to create media');
      }
    } catch (error) {
      console.error('Error creating media:', error);
      message.error('An error occurred while creating the media.');
    } finally {
      setLoading(false);
    }
  };

  if (!userLoaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
      <Card>
        <Form
          form={form}
          name="mediaCreationForm"
          onFinish={onFinish}
          layout="vertical"
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Please input the name!' }]}
              >
                <Input prefix={<FileTextOutlined />} placeholder="Enter media name" />
              </Form.Item>

              <Form.Item
                name="artist_name"
                label="Artist Name"
                rules={[{ required: true, message: 'Please input the artist name!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter artist name" />
              </Form.Item>

              <Form.Item name="genre" label="Genre">
                <Select placeholder="Select genre">
                  <Option value="Pop">Pop</Option>
                  <Option value="Rap">Rap</Option>
                  <Option value="Jazz">Jazz</Option>
                  <Option value="Classical">Classical</Option>
                </Select>
              </Form.Item>

              {(user?.role === 'Vip User' || user?.role === 'Admin') && (
                <>
                  <Form.Item label={
                    <Space>
                      Enable Monetization
                      <Tooltip title="Enabling this means monetizing your content. A 10% tax will be deducted from your earnings. Please ensure you comply with all relevant regulations.">
                        <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                      </Tooltip>
                    </Space>
                  }>
                    <Switch
                      checked={isMonetized}
                      onChange={setIsMonetized}
                    />
                  </Form.Item>
                  {isMonetized && (
                    <Form.Item
                      name="price"
                      label="Price"
                      initialValue={0}
                      rules={[{ type: 'number', min: 0, max: 15, message: 'Price must be between $0 and $15!' }]}
                    >
                      <InputNumber
                        prefix={<DollarOutlined />}
                        placeholder="Enter price"
                        style={{ width: '100%' }}
                        min={0}
                        max={15}
                        step={0.01}
                      />
                    </Form.Item>
                  )}
                </>
              )}
            </Col>
            <Col span={12}>
              <Form.Item name="description" label="Description">
                <TextArea rows={4} placeholder="Enter description" />
              </Form.Item>
              <Form.Item name="lyric" label="Lyric">
                <TextArea rows={8} placeholder="Enter lyrics" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="img_url"
                label="Image"
                rules={[{ required: true, message: 'Please upload an image!' }]}
                valuePropName="fileList"
                getValueFromEvent={(e) => e && e.fileList}
              >
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={handleImgChange}
                >
                  <div>
                    <PictureOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="audio_url"
                label="Audio"
                rules={[{ required: true, message: 'Please upload an audio file!' }]}
                valuePropName="fileList"
                getValueFromEvent={(e) => e && e.fileList}
              >
                <Upload
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={handleAudioChange}
                >
                  <Button icon={<AudioOutlined />} style={{ width: '100%', height: '100px' }}>
                    Click to upload audio
                  </Button>
                </Upload>
              </Form.Item>
              <Space>
                <Radio.Group 
                  value={transcriptionLanguage} 
                  onChange={(e) => setTranscriptionLanguage(e.target.value)}
                >
                  <Radio.Button value="en">English</Radio.Button>
                  <Radio.Button value="vi">Vietnamese</Radio.Button>
                </Radio.Group>
                <Button 
                  onClick={transcribeAudio} 
                  loading={transcribing} 
                  disabled={!audioFile}
                  style={{ marginTop: '10px' }}
                >
                  Transcribe Audio
                </Button>
              </Space>
            </Col>
          </Row>

          <Form.Item style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              Create Media
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default MediaCreationForm;

