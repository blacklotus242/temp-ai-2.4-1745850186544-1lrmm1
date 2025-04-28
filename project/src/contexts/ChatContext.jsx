import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  const loadChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          *,
          messages:chat_messages(*)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setChats(data || []);
      if (data?.length > 0 && !activeChat) {
        setActiveChat(data[0]);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      addNotification('Failed to load chats', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      const { data: chat, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: 'New Chat'
        })
        .select()
        .single();

      if (error) throw error;

      const newChat = { ...chat, messages: [] };
      setChats([newChat, ...chats]);
      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      addNotification('Failed to create new chat', 'error');
      return null;
    }
  };

  const deleteChat = async (chatId) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', chatId);

      if (error) throw error;

      setChats(chats.filter(chat => chat.id !== chatId));
      if (activeChat?.id === chatId) {
        setActiveChat(chats[0] || null);
      }
      addNotification('Chat deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting chat:', error);
      addNotification('Failed to delete chat', 'error');
    }
  };

  const renameChat = async (chatId, newTitle) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title: newTitle })
        .eq('id', chatId);

      if (error) throw error;

      setChats(chats.map(chat => 
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      ));
      if (activeChat?.id === chatId) {
        setActiveChat(prev => ({ ...prev, title: newTitle }));
      }
      addNotification('Chat renamed successfully', 'success');
    } catch (error) {
      console.error('Error renaming chat:', error);
      addNotification('Failed to rename chat', 'error');
    }
  };

  const sendMessage = async (content, role = 'user') => {
    if (!activeChat) return null;

    try {
      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: activeChat.id,
          role,
          content
        })
        .select()
        .single();

      if (error) throw error;

      const updatedChat = {
        ...activeChat,
        messages: [...(activeChat.messages || []), message],
        updated_at: new Date().toISOString()
      };

      setChats(chats.map(chat => 
        chat.id === activeChat.id ? updatedChat : chat
      ));
      setActiveChat(updatedChat);

      if (role === 'user') {
        // Get AI response
        const messages = updatedChat.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are Mission Commander, an advanced AI assistant with a cosmic military flair. Your responses should be precise, strategic, and delivered with a space commander's authority. Use terms like 'mission objectives,' 'tactical analysis,' and 'strategic operations.' Help users navigate their tasks like a seasoned space fleet commander guiding their crew through the cosmos."
            },
            ...messages
          ]
        });

        const aiResponse = completion.choices[0].message.content;
        await sendMessage(aiResponse, 'assistant');
      }

      return message;
    } catch (error) {
      console.error('Error in message handling:', error);
      addNotification('Failed to process message', 'error');
      return null;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        isLoading,
        isSidebarOpen,
        setActiveChat,
        createNewChat,
        deleteChat,
        renameChat,
        sendMessage,
        setIsSidebarOpen
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}