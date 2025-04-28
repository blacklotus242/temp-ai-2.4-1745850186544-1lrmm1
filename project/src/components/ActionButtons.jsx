import React from 'react';
import { Mail, Calendar, ListTodo, Share2, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const ActionButton = ({ icon: Icon, label, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:border-gray-600/50 hover:text-white transition-all duration-300 backdrop-blur-sm group"
  >
    <Icon className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
    <span className="text-sm font-medium">{label}</span>
  </motion.button>
);

const ActionButtons = ({ onAction }) => (
  <div className="flex flex-wrap gap-2">
    <ActionButton 
      icon={Mail} 
      label="Email" 
      onClick={() => onAction('email')} 
    />
    <ActionButton 
      icon={Calendar} 
      label="Schedule" 
      onClick={() => onAction('schedule')} 
    />
    <ActionButton 
      icon={ListTodo} 
      label="Task" 
      onClick={() => onAction('task')} 
    />
    <ActionButton 
      icon={Share2} 
      label="Share" 
      onClick={() => onAction('share')} 
    />
    <ActionButton 
      icon={Upload} 
      label="Upload" 
      onClick={() => onAction('upload')} 
    />
  </div>
);

export default ActionButtons;