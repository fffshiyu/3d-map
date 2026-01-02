import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { SHANGHAI_LANDMARKS } from '../../data/landmarks';
import type { Landmark } from '../../types';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    showWelcome, 
    focusedLandmark, 
    setFocusedLandmark,
    setSelectedLandmark 
  } = useStore();

  if (showWelcome) return null;

  const handleLandmarkClick = (landmark: Landmark) => {
    if (focusedLandmark?.id === landmark.id) {
      setSelectedLandmark(landmark);
    } else {
      setFocusedLandmark(landmark);
      setSelectedLandmark(null);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Sidebar Panel - 右侧展开 */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
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
                <button className="close-sidebar" onClick={() => setIsOpen(false)}>
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
      
      {/* Toggle Button - 导出给 Header 使用 */}
      <SidebarToggle isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
}

// 导出 toggle 按钮组件供 Header 使用
export function SidebarToggle({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  return (
    <motion.button
      className="header-btn"
      onClick={() => setIsOpen(!isOpen)}
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
  );
}
