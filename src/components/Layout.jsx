import React from 'react';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

const Layout = ({ children, theme, toggleTheme }) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      
      <main className="flex-grow relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;
