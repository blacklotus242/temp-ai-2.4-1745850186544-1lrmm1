import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare,
  Trash2,
  Plus,
  Star,
  Archive,
  Clock,
  Settings
} from 'lucide-react';

const ChatItem = ({ chat, isSelected, onSelect, onDelete }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (showConfirmDelete) {
      onDelete(new Set([chat.id]));
      setShowConfirmDelete(false);
    } else {
      setShowConfirmDelete(true);
      setTimeout(() => setShowConfirmDelete(false), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={() => onSelect(chat.id)}
      className={`
        group relative flex items-center p-3 cursor-pointer rounded-lg transition-all duration-300
        ${isSelected 
          ? 'bg-purple-500/20 border border-purple-500/40 shadow-[0_0_20px_rgba(139,92,246,0.1)]' 
          : 'hover:bg-gray-800/50 border border-transparent'
        }
      `}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-3">
          <MessageSquare className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-gray-400'}`} />
          <div>
            <p className={`truncate text-sm ${isSelected ? 'text-purple-300' : 'text-gray-300'}`}>
              {chat.title}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(chat.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleDelete}
        className={`
          opacity-0 group-hover:opacity-100 p-1 rounded transition-all duration-300
          ${showConfirmDelete 
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
            : 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
          }
        `}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

const SidebarSection = ({ title, icon: Icon, children }) => (
  <div className="space-y-2">
    <div className="flex items-center space-x-2 px-3 text-sm text-gray-400">
      <Icon className="w-4 h-4" />
      <span>{title}</span>
    </div>
    {children}
  </div>
);

const Sidebar = () => {
  const { 
    chats = [], 
    createNewChat, 
    selectedChats,
    toggleChatSelection,
    deleteChats,
    setActiveChat,
  } = useChat();

  const recentChats = chats.slice(0, 5);
  const starredChats = chats.filter(chat => chat.starred);
  const archivedChats = chats.filter(chat => chat.status === 'archived');
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-800/50">
        <button
          onClick={() => {
            const newChat = createNewChat();
            if (newChat) setActiveChat(newChat);
          }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/40 hover:bg-purple-500/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        <SidebarSection title="Recent" icon={Clock}>
          {recentChats.map((chat) => (
            <ChatItem 
              key={chat.id} 
              chat={chat}
              isSelected={selectedChats.has(chat.id)}
              onSelect={toggleChatSelection}
              onDelete={deleteChats}
            />
          ))}
        </SidebarSection>

        <SidebarSection title="Starred" icon={Star}>
          {starredChats.length === 0 ? (
            <p className="text-sm text-gray-500 px-3">No starred chats</p>
          ) : (
            starredChats.map((chat) => (
              <ChatItem 
                key={chat.id} 
                chat={chat}
                isSelected={selectedChats.has(chat.id)}
                onSelect={toggleChatSelection}
                onDelete={deleteChats}
              />
            ))
          )}
        </SidebarSection>

        <SidebarSection title="Archived" icon={Archive}>
          {archivedChats.length === 0 ? (
            <p className="text-sm text-gray-500 px-3">No archived chats</p>
          ) : (
            archivedChats.map((chat) => (
              <ChatItem 
                key={chat.id} 
                chat={chat}
                isSelected={selectedChats.has(chat.id)}
                onSelect={toggleChatSelection}
                onDelete={deleteChats}
              />
            ))
          )}
        </SidebarSection>
      </div>

      <div className="p-3 border-t border-gray-800/50">
        <div className="flex items-center justify-between text-gray-400 text-xs">
          <span>Nova AI Assistant</span>
          <Settings className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;