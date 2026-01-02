import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';

export function Hint() {
  const [visible, setVisible] = useState(true);
  const { showWelcome } = useStore();

  useEffect(() => {
    if (!showWelcome) {
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  if (showWelcome || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="hint"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 9l-3 3 3 3" />
          <path d="M9 5l3-3 3 3" />
          <path d="M15 19l3 3 3-3" />
          <path d="M19 9l3 3-3 3" />
          <circle cx="12" cy="12" r="2" />
        </svg>
        <span>Drag to rotate • Scroll to zoom • Right-click to pan</span>
      </motion.div>
    </AnimatePresence>
  );
}


