'use client';

import React from 'react';
import { Video, Copy } from 'lucide-react';
import { useStreaming } from '../../../components/Admin/Streaming/StreamingContext';
import CreateRoomForm from '../../../components/Admin/Streaming/CreateRoomForm';
import RoomSelector from '../../../components/Admin/Streaming/RoomSelector';
import EnterLiveButton from '../../../components/Admin/Streaming/EnterLiveButton';
import WaitingListPanel from '../../../components/Admin/Streaming/WaitingListPanel';
import ParticipantsListPanel from '../../../components/Admin/Streaming/ParticipantsListPanel';
import HostActionsPanel from '../../../components/Admin/Streaming/HostActionsPanel';
import { useSearchParams } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import LiveRoomManager from './LiveRoomManager';
interface EventCreateProps {
  eventId?: number;
}
export default function EventCreate({ eventId }: EventCreateProps) {
  const { room, roomName } = useStreaming();
  const effective = roomName || room?.roomName || '';


  const location = useLocation() as any;
  const copyRoomId = async () => {
    if (!effective) return;
    try {
      await navigator.clipboard.writeText(effective);
      alert('Đã sao chép Room ID!');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = effective;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Đã sao chép Room ID!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Video className="w-6 h-6 text-red-600" />
          Tạo & Quản lý Phòng Livestream
        </h1>
       <p className="text-gray-600 mt-1">
  Tạo phòng, chọn/nhập RoomName, vào live và quản lý quyền người tham gia – tất cả trên một trang.
</p>
      </div>

      {/* Tạo phòng */}
    <CreateRoomForm eventId={eventId} />

      {/* Chọn/nhập RoomName */}
      <RoomSelector />

      {/* Thông tin phòng (nếu đã có roomName hiện hành) */}
      {effective && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Room:</p>
              <p className="font-mono text-sm text-gray-800 break-all">{effective}</p>
            </div>
            <button
              onClick={copyRoomId}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sao chép Room ID"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {room?.createdAt && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Created:</p>
                <p className="text-sm text-gray-800">
                  {new Date(room.createdAt).toLocaleString()}
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Đang hoạt động
              </span>
            </div>
          )}
        </div>
      )}

      {/* Đi tới phòng live */}
      <EnterLiveButton />

     

      <LiveRoomManager eventId={eventId} />   {/* 🔥 thêm eventId ở đây */}
    </div>
  );
}
