import React from 'react';
import { ChatProvider } from '../contexts/ChatContext';
import Sidebar from '../components/MissionControl/Sidebar';
import ChatArea from '../components/MissionControl/ChatArea';

export default function Chat() {
  return (
    <ChatProvider>
      <div className="h-screen flex bg-gray-900 relative">
        <Sidebar />
        <ChatArea />
      </div>
    </ChatProvider>
  );
}