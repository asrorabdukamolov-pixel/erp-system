import React, { useState, useRef, useEffect } from 'react';

const ImageZoomPreview = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Set up passive wheel listener to prevent default page scrolling while zooming
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelRaw = (e) => {
      e.preventDefault();
      const zoomStep = 0.2;
      
      setScale((prevScale) => {
        let newScale;
        if (e.deltaY < 0) {
          // Zoom in
          newScale = Math.min(8, prevScale + zoomStep);
        } else {
          // Zoom out
          newScale = Math.max(1, prevScale - zoomStep);
        }

        // If we reset to 1x scale, center the image
        if (newScale === 1) {
          setPosition({ x: 0, y: 0 });
        }
        return newScale;
      });
    };

    container.addEventListener('wheel', handleWheelRaw, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheelRaw);
    };
  }, []);

  // Handle global mouse move and mouse up during dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMoveRaw = (e) => {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUpRaw = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMoveRaw);
    window.addEventListener('mouseup', handleMouseUpRaw);

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveRaw);
      window.removeEventListener('mouseup', handleMouseUpRaw);
    };
  }, [isDragging, dragStart]);

  // Start dragging
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    if (scale <= 1) return; // Only pan when zoomed in

    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    e.preventDefault();
  };

  // Reset zoom on double click or toggle to 2.5x
  const handleDoubleClick = () => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  };

  // Reset if src changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [src]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
        userSelect: 'none',
        background: 'rgba(0,0,0,0.4)',
        borderRadius: '8px'
      }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          transformOrigin: 'center center',
          pointerEvents: 'none' // Let container handle dragging events
        }}
      />
      
      {/* Zoom info and instructions badge */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(13, 13, 24, 0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#e2e8f0',
          padding: '8px 16px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '500',
          pointerEvents: 'none',
          backdropFilter: 'blur(8px)',
          zIndex: 10,
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          whiteSpace: 'nowrap'
        }}
      >
        <span style={{ color: 'var(--accent-gold)', fontWeight: '700' }}>
          Lupa: {Math.round(scale * 100)}%
        </span>
        <span style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.15)' }} />
        <span>G'ildirak: Kattalashtirish</span>
        <span style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.15)' }} />
        <span>Chap tugma: Sudrash</span>
        <span style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.15)' }} />
        <span>2-marta bosish: Tiklash</span>
      </div>
    </div>
  );
};

export default ImageZoomPreview;
