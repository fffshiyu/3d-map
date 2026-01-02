import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';

export function LandmarkDetail() {
  const { selectedLandmark, setSelectedLandmark, setFocusedLandmark } = useStore();

  const handleClose = () => {
    setSelectedLandmark(null);
    setFocusedLandmark(null);
  };

  return (
    <AnimatePresence>
      {selectedLandmark && (
        <motion.div
          className="landmark-detail"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <button className="close-btn" onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          
          <div className="detail-image">
            <img 
              src={selectedLandmark.image} 
              alt={selectedLandmark.nameEn}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800';
              }}
            />
            <div className="image-overlay">
              <span 
                className="category-badge"
                style={{ backgroundColor: selectedLandmark.color }}
              >
                {selectedLandmark.category}
              </span>
            </div>
          </div>
          
          <div className="detail-content">
            <h2 className="detail-title">{selectedLandmark.nameEn}</h2>
            <h3 className="detail-subtitle">{selectedLandmark.name}</h3>
            
            <div className="detail-stats">
              <div className="stat">
                <span className="stat-value">{selectedLandmark.height}m</span>
                <span className="stat-label">Height</span>
              </div>
              <div className="stat">
                <span className="stat-value">{selectedLandmark.coordinates.lat.toFixed(2)}°</span>
                <span className="stat-label">Latitude</span>
              </div>
              <div className="stat">
                <span className="stat-value">{selectedLandmark.coordinates.lng.toFixed(2)}°</span>
                <span className="stat-label">Longitude</span>
              </div>
            </div>
            
            <p className="detail-description">
              {selectedLandmark.description}
            </p>
            
            <div className="detail-actions">
              <button 
                className="action-btn primary"
                onClick={() => window.open(`https://www.google.com/maps?q=${selectedLandmark.coordinates.lat},${selectedLandmark.coordinates.lng}`, '_blank')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                View on Map
              </button>
              <button className="action-btn secondary" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

