import React from 'react';

/**
 * Modern Animated Loader Component for IGNITRON 2K26
 * Features smooth geometric morph animation
 */
export default function Loader({ text = 'Loading...', fullScreen = false, size = 'default' }) {
  return (
    <div className={`loader-wrapper ${fullScreen ? 'loader-fullscreen' : ''} ${size === 'small' ? 'loader-sm' : ''}`}>
      <div className="loader" />
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
}

