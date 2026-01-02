import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';

export function Compass() {
  const { showWelcome, resetView, isNightMode } = useStore();

  if (showWelcome) return null;

  return (
    <motion.button
      className={`compass ${isNightMode ? 'night' : ''}`}
      onClick={resetView}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title="Reset View"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <polygon 
          points="12,2 14,10 12,8 10,10" 
          fill="#ff4444" 
          stroke="#ff4444"
        />
        <polygon 
          points="12,22 14,14 12,16 10,14" 
          fill="currentColor" 
          stroke="currentColor"
        />
        <text x="12" y="5" textAnchor="middle" fontSize="4" fill="currentColor" fontWeight="bold">N</text>
      </svg>
    </motion.button>
  );
}


