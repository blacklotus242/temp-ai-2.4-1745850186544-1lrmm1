import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MissionLayout({ sidebar, children }) {
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <div className="h-screen flex bg-gray-900 overflow-hidden relative">
      {/* Cosmic Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg?auto=compress&cs=tinysrgb&w=1920')",
          filter: "brightness(0.2)"
        }}
      />

      {/* Sidebar */}
      <div className="relative z-10">
        <AnimatePresence>
          {showSidebar && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => setShowSidebar(false)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30 p-1 rounded-full bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-gray-700/50 hover:text-white transition-all duration-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {!showSidebar && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowSidebar(true)}
            className="fixed left-4 top-1/2 transform -translate-y-1/2 z-30 p-1 rounded-full bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-gray-700/50 hover:text-white transition-all duration-300"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}

        <motion.div 
          className="fixed top-0 left-0 h-full bg-gray-900/50 backdrop-blur-md border-r border-gray-800/50 flex flex-col z-40"
          initial={false}
          animate={{ 
            width: showSidebar ? '280px' : '0px',
            opacity: showSidebar ? 1 : 0
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        >
          {sidebar}
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div 
        className="flex-1 relative z-10"
        initial={false}
        animate={{
          marginLeft: showSidebar ? '280px' : '0px'
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}