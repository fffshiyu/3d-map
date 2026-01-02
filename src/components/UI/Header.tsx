import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { SHANGHAI_LANDMARKS } from '../../data/landmarks';
import type { Landmark } from '../../types';

export function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { 
    showLabels, 
    toggleLabels,
    showWelcome,
    focusedLandmark,
    setFocusedLandmark,
    setSelectedLandmark,
  } = useStore();

  if (showWelcome) return null;

  const handleLandmarkClick = (landmark: Landmark) => {
    if (focusedLandmark?.id === landmark.id) {
      setSelectedLandmark(landmark);
    } else {
      setFocusedLandmark(landmark);
      setSelectedLandmark(null);
    }
    setSidebarOpen(false);
  };

  return (
    <>
      <motion.header
        className="header"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="header-left">
          <h1 className="header-title">
            Shanghai Landmarks
          </h1>
        </div>
        
        <div className="header-right">
          {/* Labels 按钮 */}
          <motion.button
            className={`header-btn ${showLabels ? 'active' : ''}`}
            onClick={toggleLabels}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Toggle Labels"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </motion.button>
          
          {/* Landmarks 按钮 */}
          <motion.button
            className="header-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Landmarks"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </motion.button>
        </div>
      </motion.header>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            
            <motion.aside
              className="sidebar"
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="sidebar-header">
                <h2>Explore Landmarks</h2>
                <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              
              <div className="sidebar-content">
                {SHANGHAI_LANDMARKS.map((landmark, index) => (
                  <motion.div
                    key={landmark.id}
                    className={`landmark-item ${focusedLandmark?.id === landmark.id ? 'focused' : ''}`}
                    onClick={() => handleLandmarkClick(landmark)}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: -5 }}
                  >
                    <div 
                      className="landmark-color" 
                      style={{ backgroundColor: landmark.color }}
                    />
                    <div className="landmark-info">
                      <div className="landmark-name">
                        {landmark.nameEn}
                      </div>
                      <div className="landmark-meta">
                        {landmark.name} • {landmark.height}m
                      </div>
                    </div>
                    <svg 
                      className="landmark-arrow" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </motion.div>
                ))}
              </div>
              
              <div className="sidebar-footer">
                <p>Click a landmark to focus, click again for details</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
