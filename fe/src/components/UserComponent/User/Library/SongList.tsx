import React from 'react'
import { Empty, Button } from 'antd'
import { Edit2, MessageSquare, AlertTriangle, Clock, PlusCircle, DollarSign } from 'lucide-react'
import Link from 'next/link';

interface MediaType {
  id: number;
  name?: string | null;
  artist_name?: string | null;
  img_url?: string | null;
  audio_url?: string | null;
  description?: string | null;
  lyric?: string | null;
  duration?: string | null;
  media_type: 'Song' | 'Podcast';
  genre?: 'Pop' | 'Rap' | 'Jazz' | 'Classical' | null;
  likes_count?: number | null;
  isBuy: boolean | null;
  price?: string | null;
  comments_count?: number | null;
  reports_count?: number | null;
  createdBy?: number | null;
  deletedBy?: number | null;
  created_at: Date;
  updated_at: Date;
  status: 'Pending' | 'Rejected' | 'Approved';
  isLiked: boolean | null;
}

interface SongListProps {
  items: MediaType[];
  onEdit: (id: number) => void;
  onLike: (id: number) => void;
  onCreate: () => void;
}

export default function SongList({ items, onEdit, onLike, onCreate }: SongListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Media</h2>
        <Button
          type="primary"
          icon={<PlusCircle size={16} />}
          onClick={onCreate}
          className="flex items-center"
        >
          <Link href="/home/library/media">Create New</Link>
        </Button>
      </div>
      <div className="flex-grow overflow-auto bg-white rounded-lg shadow-md p-4">
        {items.length === 0 ? (
          <Empty description="No items found" />
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 ease-in-out">
                <div className="flex items-center p-4">
                  <img src={item.img_url ? `http://localhost:3001${item.img_url}` : '/placeholder.svg'} alt={`${item.name} cover`} className="w-16 h-16 rounded-md mr-4" />
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-800">{item.name || 'Untitled'}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{item.artist_name || 'Unknown Artist'}</p>
                    <p className="text-xs text-gray-500">{item.genre || 'No Genre'}</p>
                    {item.price !== null && (
                      <p className="text-sm text-green-600 font-semibold mt-1">
                        <DollarSign size={16} className="inline mr-1" />
                        {(parseFloat(item.price) / 100).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500" title="Likes">
                        ❤️ {item.likes_count || 0}
                      </span>
                      <span className="text-sm text-gray-500" title="Comments">
                        <MessageSquare size={16} className="inline mr-1" />
                        {item.comments_count || 0}
                      </span>
                      <span className="text-sm text-gray-500" title="Reports">
                        <AlertTriangle size={16} className="inline mr-1" />
                        {item.reports_count || 0}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500" title="Duration">
                        <Clock size={16} className="inline mr-1" />
                        {item.duration || '--:--'}
                      </span>
                      <Button
                        type="primary"
                        icon={<Edit2 size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item.id);
                        }}
                        className="flex items-center"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}