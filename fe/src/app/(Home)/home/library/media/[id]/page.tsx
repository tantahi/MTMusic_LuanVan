'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Button,
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  message,
  Space,
  Upload,
  Image,
  Card,
  Typography,
  Switch,
  Radio,
} from 'antd';
import { UploadOutlined, FileTextOutlined, PictureOutlined, AudioOutlined, DollarOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { MediaType } from '@/types';
import mediaService from '@/services/media.service';
import { handleError } from '@/lib/utils';
import { useAtomValue } from 'jotai';
import { userAtom, tokenAtom } from '@/lib/atom/user.atom';
import TrackList from '@/components/TrackList';
import { usePlayerStore } from '@/hooks/usePlayer';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

interface MediaFormProps {
  params: {
    id?: string;
  };
}

export default function MediaForm({ params }: MediaFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [media, setMedia] = useState<MediaType | null>(null);
  const [lyric, setLyric] = useState<string>('');
  const [audioFile, setAudioFile] = useState<UploadFile | null>(null);
  const [isMonetized, setIsMonetized] = useState(false);
  const [transcriptionLanguage, setTranscriptionLanguage] = useState<'en' | 'vi'>('en');
  const token = useAtomValue(tokenAtom);
  const user = useAtomValue(userAtom);
//   const { addTrack, updateTrack } = usePlayerStore();
  const mediaId = params.id ? parseInt(params.id) : undefined;

  useEffect(() => {
    if (mediaId) {
      fetchMediaDetails();
    }
  }, [mediaId]);

  const fetchMediaDetails = async () => {
    if (!token) {
      message.error('No authentication token found');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3001/media/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const mediaData = response.data.data;
      if (mediaData.price !== undefined) {
        mediaData.price = mediaData.price / 100; // Convert cents to USD
      }
      setMedia(mediaData);
      form.setFieldsValue(mediaData);
      setLyric(mediaData.lyric || '');
      setIsMonetized(mediaData.price > 0);
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: MediaType) => {
    if (!token) {
      message.error('No authentication token found');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          if (key === 'img_url' || key === 'audio_url') {
            if (values[key] && values[key].file) {
              formData.append(key, values[key].file);
            }
          } else if (key !== 'lyric' && key !== 'price') {
            formData.append(key, values[key]);
          }
        }
      });

      formData.append('lyric', lyric);

      if (isMonetized && values.price) {
        const priceInCents = Math.round(values.price * 100); // Convert USD to cents
        formData.append('price', priceInCents.toString());
      } else {
        formData.append('price', '0');
      }

      let responseData;
      if (mediaId) {
        responseData = await mediaService.updateMedia(mediaId, formData, token);
        message.success('Media updated successfully');
        // updateTrack({
        //   id: mediaId,
        //   title: values.name,
        //   artist: values.artist_name,
        //   audioSrc: values.audio_url ? URL.createObjectURL(values.audio_url.file) : media?.audio_url,
        //   coverArt: values.img_url ? URL.createObjectURL(values.img_url.file) : media?.img_url,
        // });
      } else {
        responseData = await mediaService.createMedia(formData, token);
        message.success('Media created successfully');
        // addTrack({
        //   id: responseData.id,
        //   title: values.name,
        //   artist: values.artist_name,
        //   audioSrc: URL.createObjectURL(values.audio_url.file),
        //   coverArt: URL.createObjectURL(values.img_url.file),
        // });
      }
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!mediaId || !token) {
      message.error('No media ID or authentication token found');
      return;
    }

    try {
      setLoading(true);
      await mediaService.deleteMedia(mediaId, token);
      message.success('Media deleted successfully');
      // Remove the track from the player
      // Assuming you have a removeTrack function in usePlayerStore
      // removeTrack(mediaId);
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setAudioFile(fileList[0]);
  };

  const handleTranscribe = async () => {
    if (!audioFile) {
      message.error('Please upload an audio file first');
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
      setLyric(response.data.lyrics);
      form.setFieldsValue({ lyric: response.data.lyrics });
      message.success('Transcription completed');
    } catch (error: any) {
      console.error('Error transcribing audio:', error);
      message.error('Failed to transcribe the audio');
    } finally {
      setTranscribing(false);
    }
  };

  return (
    <Card className="w-full p-4 m-0">
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="Name" name="name" rules={[{ required: true }]}>
              <Input prefix={<FileTextOutlined />} />
            </Form.Item>
            <Form.Item
              label="Artist Name"
              name="artist_name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Media Type"
              name="media_type"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="Song">Song</Option>
                <Option value="Podcast">Podcast</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Genre" name="genre">
              <Select>
                <Option value="Pop">Pop</Option>
                <Option value="Rap">Rap</Option>
                <Option value="Jazz">Jazz</Option>
                <Option value="Classical">Classical</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Monetize">
              <Switch checked={isMonetized} onChange={setIsMonetized} />
            </Form.Item>
            {isMonetized && (
              <Form.Item
                label="Price (USD)"
                name="price"
                rules={[
                  { required: true, message: 'Please input the price!' },
                  { type: 'number', min: 0.01, max: 15, message: 'Price must be between $0.01 and $15!' }
                ]}
              >
                <InputNumber
                  prefix={<DollarOutlined />}
                  min={0.01}
                  max={15}
                  step={0.01}
                  precision={2}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            )}
          </Col>

          <Col span={12}>
            {mediaId && (
              <>
                <Form.Item label="Status" name="status">
                  <Input disabled />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="Likes" name="likes_count">
                      <InputNumber disabled min={0} className="w-full" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Comments" name="comments_count">
                      <InputNumber disabled min={0} className="w-full" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Reports" name="reports_count">
                      <InputNumber disabled min={0} className="w-full" />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            <Form.Item label="Description" name="description">
              <TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="Image Upload" name="img_url">
              <Upload
                name="img_url"
                listType="picture-card"
                maxCount={1}
                beforeUpload={() => false}
              >
                <div>
                  <PictureOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
            {form.getFieldValue('img_url') && (
              <Image
                width={200}
                src={`http://localhost:3001${form.getFieldValue('img_url')}`}
              />
            )}
          </Col>

          <Col span={12}>
            <Form.Item label="Audio Upload" name="audio_url">
              <Upload
                name="audio_url"
                maxCount={1}
                beforeUpload={() => false}
                onChange={handleAudioChange}
              >
                <Button icon={<AudioOutlined />} style={{ width: '100%', height: '100px' }}>
                  Click to Upload Audio
                </Button>
              </Upload>
            </Form.Item>
            {form.getFieldValue('audio_url') && (
              <audio controls className="w-full mt-4">
                <source
                  src={`http://localhost:3001${form.getFieldValue('audio_url')}`}
                  type="audio/mpeg"
                />
              </audio>
            )}
            <Space>
              <Radio.Group 
                value={transcriptionLanguage} 
                onChange={(e) => setTranscriptionLanguage(e.target.value)}
              >
                <Radio.Button value="en">English</Radio.Button>
                <Radio.Button value="vi">Vietnamese</Radio.Button>
              </Radio.Group>
              <Button 
                onClick={handleTranscribe} 
                loading={transcribing} 
                disabled={!audioFile}
                style={{ marginTop: '10px' }}
              >
                Transcribe Audio
              </Button>
            </Space>
          </Col>
        </Row>

        <Form.Item label="Lyric" name="lyric">
          <TextArea 
            rows={6} 
            value={lyric} 
            onChange={(e) => setLyric(e.target.value)}
            disabled={transcribing}
          />
        </Form.Item>

        <Form.Item>
          <Space size="middle" className="flex justify-center mt-6">
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              {mediaId ? 'Update' : 'Create'}
            </Button>
            {mediaId && (
              <Button
                type="default"
                danger
                onClick={handleDelete}
                loading={loading}
                size="large"
              >
                Delete
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}