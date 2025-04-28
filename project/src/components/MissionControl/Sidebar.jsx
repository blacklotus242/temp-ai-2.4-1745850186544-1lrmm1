import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useChat } from '../../contexts/ChatContext';
import { motion } from 'framer-motion';
import { 
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  MessageSquare
} from 'lucide-react';

const ChatItem = ({ chat, isActive, onSelect, onRename, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(chat.title);

  const handleRename = (e) => {
    e.preventDefault();
    onRename(chat.id, newTitle);
    setIsEditing(false);
  };

  return (
    <div className={`group flex items-center p-3 rounded-lg transition-all duration-300 ${
      isActive ? 'bg-purple-500/20' : 'hover:bg-gray-800/50'
    }`}>
      <MessageSquare className="w-5 h-5 text-gray-400 mr-3" />
      
      {isEditing ? (
        <form onSubmit={handleRename} className="flex-1 flex">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 bg-black/30 text-white rounded px-2 py-1"
            autoFocus
          />
          <button type="submit" className="ml-2 text-purple-400 hover:text-purple-300">
            Save
          </button>
        </form>
      ) : (
        <>
          <span 
            className="flex-1 text-gray-300 cursor-pointer"
            onClick={() => onSelect(chat.id)}
          >
            {chat.title}
          </span>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-400 hover:text-purple-400"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(chat.id)}
              className="p-1 text-gray-400 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default function Sidebar() {
  const { isDark, toggleTheme } = useTheme();
  const { chats, activeChat, createNewChat, deleteChat, renameChat, setActiveChat } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNewChat = () => {
    const newChat = createNewChat();
    if (newChat) {
      setActiveChat(newChat);
    }
  };

  return (
    <>
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 bg-gray-800 rounded-full p-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
      
      <motion.div
        initial={false}
        animate={{
          width: isSidebarOpen ? '300px' : '0px',
          opacity: isSidebarOpen ? 1 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        className="h-full bg-gray-900 border-r border-gray-800 flex flex-col relative"
      >
        <button
          onClick={toggleSidebar}
          className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 rounded-full p-2 text-gray-400 hover:text-white z-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chats.map(chat => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={activeChat?.id === chat.id}
              onSelect={setActiveChat}
              onRename={renameChat}
              onDelete={deleteChat}
            />
          ))}
        </div>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <div className="flex items-center justify-center text-gray-400">
            <button
              onClick={toggleTheme}
              className="p-2 hover:text-white transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}