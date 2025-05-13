import React, { useState } from 'react'
import { Empty, Button, Modal, Form, Input, Select, Upload, message } from 'antd'
import { Edit2, PlusCircle, Music, Album, Heart, ChevronDown, ChevronUp, CloudUploadIcon as CloudUploadOutlined } from 'lucide-react'
import axios from 'axios'
import { useAtomValue } from 'jotai'
import { userAtom, tokenAtom } from '@/lib/atom/user.atom'
import TrackList from '@/components/TrackList'
import { usePlayerStore } from '@/hooks/usePlayer'
import Link from 'next/link'

interface MediaType {
  id: number;
  name?: string | null;
  artist_name?: string | null;
  duration?: string | null;
}

interface PlaylistType {
  id: number;
  name: string;
  genre?: 'Pop' | 'Rap' | 'Jazz' | 'Classical' | null;
  artist_name?: string | null;
  img_url?: string | null;
  user_id: number;
  type: 'Playlist' | 'Album' | 'Favourite';
  created_at: Date;
  items?: MediaType[];
}

interface PlaylistListProps {
  items: PlaylistType[];
  onEdit: (id: number) => void;
  onCreate: () => void;
}

export default function PlaylistList({ items, onEdit, onCreate }: PlaylistListProps) {
  const [expandedPlaylist, setExpandedPlaylist] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const token = useAtomValue(tokenAtom);
  const user = useAtomValue(userAtom);
  const { setCurrentTrack } = usePlayerStore();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Playlist':
        return <Music size={16} />;
      case 'Album':
        return <Album size={16} />;
      case 'Favourite':
        return <Heart size={16} />;
      default:
        return null;
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedPlaylist(expandedPlaylist === id ? null : id);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('genre', values.genre);
      formData.append('type', 'Playlist');
      formData.append('user_id', user.id.toString());
      if (values.img_url && values.img_url[0]) {
        formData.append('img_url', values.img_url[0].originFileObj);
      }

      const response = await axios.post('http://localhost:3001/playlists', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        message.success('Playlist created successfully');
        setIsModalVisible(false);
        form.resetFields();
        onCreate();
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      message.error('Failed to create playlist');
    }
  };

  const handleImageUpload = (info: any) => {
    const { status } = info.file;
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Playlists</h2>
        <Button
          type="primary"
          icon={<PlusCircle size={16} />}
          onClick={showModal}
          className="flex items-center"
        >
          Create New Playlist
        </Button>
      </div>
      <div className="flex-grow overflow-auto bg-white rounded-lg shadow-md p-4">
        {items.length === 0 ? (
          <Empty description="No playlists found" />
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 ease-in-out">
                <div className="flex items-center p-4">
                  <img src={item.img_url ? `http://localhost:3001${item.img_url}` : '/placeholder.svg'} alt={`${item.name} cover`} className="w-16 h-16 rounded-md mr-4" />
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800 flex items-center">
                        {getTypeIcon(item.type)}
                        <span className="ml-1">{item.type}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{item.artist_name || 'Various Artists'}</p>
                    <p className="text-xs text-gray-500">
                      {item.genre || 'Mixed'} • {item.items?.length || 0} tracks
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="primary"
                      icon={<Edit2 size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(item.id);
                      }}
                      className="flex items-center"
                    >
                      <Link href={`/home/playlist/${item.id}`}>Edit</Link>
                    </Button>
                    {item.items && item.items.length > 0 && (
                      <Button
                        icon={expandedPlaylist === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        onClick={() => toggleExpand(item.id)}
                        className="flex items-center"
                      >
                        {expandedPlaylist === item.id ? 'Hide' : 'Show'} Tracks
                      </Button>
                    )}
                  </div>
                </div>
                {expandedPlaylist === item.id && item.items && (
                  <div className="px-4 pb-4">
                    <TrackList tracks={item.items} onTrackSelect={(track) => setCurrentTrack(track)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal
        title="Create New Playlist"
        visible={isModalVisible}
        onOk={handleCreate}
        onCancel={handleCancel}
        okText="Create"
      >
        <Form form={form} layout="vertical" name="create_playlist_form">
          <Form.Item
            name="img_url"
            label="Cover Image"
            rules={[{ required: true, message: 'Please upload an image!' }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => e && e.fileList}
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
              onChange={handleImageUpload}
            >
              <div>
                <CloudUploadOutlined />
                <div className="mt-2">Upload</div>
              </div>
            </Upload>
          </Form.Item>
          <Form.Item
            name="name"
            label="Playlist Name"
            rules={[{ required: true, message: 'Please input the playlist name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Playlist Description"
            rules={[{ required: true, message: 'Please input the playlist description!' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="genre"
            label="Genre"
            rules={[{ required: true, message: 'Please select a genre!' }]}
          >
            <Select>
              <Select.Option value="Pop">Pop</Select.Option>
              <Select.Option value="Rap">Rap</Select.Option>
              <Select.Option value="Jazz">Jazz</Select.Option>
              <Select.Option value="Classical">Classical</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

