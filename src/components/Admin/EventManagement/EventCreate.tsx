'use client';

import React, { useState, useEffect } from 'react';
import { Video, Clock, Users, Plus, X, Copy, ExternalLink, Mic, MicOff, UserCheck, UserX, Crown } from 'lucide-react';
import { format } from 'date-fns';

interface Participant {
  userId: number;
  rtcUid: number;
  role: 'Host' | 'Audience';
  status: 'Admitted' | 'Waiting';
  name?: string;
}

export default function EventCreate() {
  const [roomName, setRoomName] = useState('');
  const [createdRoom, setCreatedRoom] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [pendingUserId, setPendingUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'Host' | 'Audience'>('Audience');

  // Tạo Room ID an toàn
  const generateRoomId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'room-';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += `-${Date.now().toString(36)}`;
    return result;
  };

  // Tạo phòng
  const handleCreateRoom = () => {
    if (!roomName.trim()) return;

    const roomId = generateRoomId();
    setCreatedRoom(roomId);
    setCreatedAt(new Date());

    // Host tự động vào phòng
    setParticipants([
      {
        userId: Date.now(), // Dùng timestamp làm ID tạm
        rtcUid: Math.floor(Math.random() * 10000),
        role: 'Host',
        status: 'Admitted'
      }
    ]);
  };

  // Giả lập người dùng yêu cầu tham gia
  const simulateJoinRequest = () => {
    const newUser: Participant = {
      userId: Date.now() + Math.floor(Math.random() * 1000),
      rtcUid: Math.floor(Math.random() * 10000),
      role: 'Audience',
      status: 'Waiting'
    };
    setParticipants(prev => [...prev, newUser]);
  };

  // Admit
  const handleAdmit = (userId: number) => {
    setParticipants(prev =>
      prev.map(p => (p.userId === userId ? { ...p, status: 'Admitted' } : p))
    );
  };

  // Reject
  const handleReject = (userId: number) => {
    setParticipants(prev => prev.filter(p => p.userId !== userId));
  };

  // Set Role
  const handleSetRole = (userId: number, role: 'Host' | 'Audience') => {
    setParticipants(prev =>
      prev.map(p => (p.userId === userId ? { ...p, role } : p))
    );
  };

  // Sao chép Room ID (an toàn)
  const copyRoomId = async () => {
    if (!createdRoom) return;
    try {
      await navigator.clipboard.writeText(createdRoom);
      alert('Đã sao chép Room ID!');
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = createdRoom;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Đã sao chép Room ID!');
    }
  };

  // Vào phòng live
  const goToLiveRoom = () => {
    if (createdRoom) {
      const url = `/stream?room=${encodeURIComponent(createdRoom)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Tự động làm mới (giả lập người tham gia)
  useEffect(() => {
    const interval = setInterval(() => {
      if (createdRoom && Math.random() > 0.7) {
        simulateJoinRequest();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [createdRoom]);

  return (
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Video className="w-6 h-6 text-red-600" />
            Tạo Phòng
          </h1>
          <p className="text-gray-600 mt-1">Tạo phòng livestream để tổ chức sự kiện trực tuyến</p>
        </div>

        {/* Form tạo phòng */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề phòng <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
              placeholder="Nhập tiêu đề phòng livestream..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              onClick={handleCreateRoom}
              disabled={!roomName.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Tạo phòng
            </button>
          </div>
        </div>

        {/* Thông tin phòng */}
        {createdRoom && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Room:</p>
                <p className="font-mono text-sm text-gray-800 break-all">{createdRoom}</p>
              </div>
              <button
                onClick={copyRoomId}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sao chép Room ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Created:</p>
                <p className="text-sm text-gray-800">
                  {createdAt ? format(createdAt, 'dd/MM/yyyy, HH:mm:ss') : ''}
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Đang hoạt động
              </span>
            </div>
          </div>
        )}

        {/* Chọn/nhập RoomName */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn/nhập RoomName
          </label>
          <input
            type="text"
            value={createdRoom || ''}
            readOnly
            placeholder="Room sẽ hiển thị sau khi tạo"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono text-sm"
          />
        </div>

        {/* Vào phòng */}
        {createdRoom && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Đi tới phòng live</p>
                <p className="text-xs text-gray-500 mt-1">Room hiện tại: {createdRoom}</p>
              </div>
              <button
                onClick={goToLiveRoom}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium flex items-center gap-2 shadow-md"
              >
                <ExternalLink className="w-4 h-4" />
                Vào phòng
              </button>
            </div>
          </div>
        )}

        {/* Người trong phòng */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Người đang trong phòng ({participants.filter(p => p.status === 'Admitted').length})
            </h3>
            <span className="text-xs text-blue-600">Tự làm mới (3s)</span>
          </div>

          <div className="space-y-3">
            {participants
              .filter(p => p.status === 'Admitted')
              .map((p) => (
                <div key={p.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {p.role === 'Host' ? <Crown className="w-4 h-4" /> : p.rtcUid % 100}
                    </div>
                    <div>
                      <p className="font-medium text-sm">UserId: {p.userId}</p>
                      <p className="text-xs text-gray-500">RTC UID: {p.rtcUid}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      p.role === 'Host' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {p.role}
                    </span>
                    {p.role === 'Host' ? (
                      <Mic className="w-4 h-4 text-green-600" />
                    ) : (
                      <MicOff className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            {participants.filter(p => p.status === 'Admitted').length === 0 && (
              <p className="text-center text-gray-500 text-sm py-4">Chưa có người tham gia</p>
            )}
          </div>
        </div>

        {/* Quản lý người tham gia */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quản lý người tham gia</h3>
          
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                UserId mục tiêu
              </label>
              <input
                type="number"
                value={pendingUserId}
                onChange={(e) => setPendingUserId(e.target.value)}
                placeholder="Nhập UserId"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="min-w-32">
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'Host' | 'Audience')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Audience">Audience</option>
                <option value="Host">Host</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (pendingUserId) {
                    const newUser: Participant = {
                      userId: parseInt(pendingUserId),
                      rtcUid: Math.floor(Math.random() * 10000),
                      role: selectedRole,
                      status: 'Waiting'
                    };
                    setParticipants(prev => [...prev, newUser]);
                    setPendingUserId('');
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
              >
                <UserCheck className="w-3 h-3" />
                Admit
              </button>
              <button
                onClick={() => setPendingUserId('')}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <UserX className="w-3 h-3" />
                Reject
              </button>
              <button
                onClick={() => {
                  if (pendingUserId) {
                    handleSetRole(parseInt(pendingUserId), selectedRole);
                    setPendingUserId('');
                  }
                }}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
              >
                <Crown className="w-3 h-3" />
                Set Role
              </button>
            </div>
          </div>

          {/* Người chờ duyệt */}
          {participants.filter(p => p.status === 'Waiting').length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Đang chờ duyệt:</p>
              <div className="space-y-2">
                {participants.filter(p => p.status === 'Waiting').map((p) => (
                  <div key={p.userId} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg text-sm">
                    <span>UserId: {p.userId} (RTC: {p.rtcUid})</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleAdmit(p.userId)}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Admit
                      </button>
                      <button
                        onClick={() => handleReject(p.userId)}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
  );
}