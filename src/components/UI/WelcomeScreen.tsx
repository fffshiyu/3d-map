import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';

export function WelcomeScreen() {
  const { showWelcome, setShowWelcome, isLoading } = useStore();

  if (!showWelcome) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="welcome-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* 背景图案 */}
        <div className="welcome-bg-pattern" />
        
        <motion.div
          className="welcome-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.h1
            className="welcome-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Explore Shanghai
          </motion.h1>
          
          <motion.p
            className="welcome-desc"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            Discover the iconic landmarks of China's most vibrant metropolis
          </motion.p>
          
          <motion.button
            className="explore-button"
            onClick={() => !isLoading && setShowWelcome(false)}
            disabled={isLoading}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            whileHover={!isLoading ? { scale: 1.03, y: -3 } : {}}
            whileTap={!isLoading ? { scale: 0.97 } : {}}
          >
            {isLoading ? (
              <span className="loading-content">
                <span className="loading-spinner" />
                <span>Loading map data...</span>
              </span>
            ) : (
              <span className="ready-content">
                <span>Explore</span>
                <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </motion.button>
          
          {isLoading && (
            <motion.p
              className="loading-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              Fetching real map data from OpenStreetMap...
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
