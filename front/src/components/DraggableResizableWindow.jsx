import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const DraggableResizableWindow = ({
  title,
  onClose,
  initialWidth = 800,
  initialHeight = 600,
  initialX = 100,
  initialY = 100,
  minWidth = 400,
  minHeight = 300,
  zIndex = 10000,
  children,
  headerActions
}) => {
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
    x: initialX,
    y: initialY
  });

  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0
  });

  const [resizeState, setResizeState] = useState({
    isResizing: false,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0
  });

  const handleDragStart = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('a')) {
      return;
    }

    setDragState({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: dimensions.x,
      startTop: dimensions.y
    });

    e.preventDefault();
  };

  const handleResizeStart = (e) => {
    if (e.button !== 0) return;

    setResizeState({
      isResizing: true,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: dimensions.width,
      startHeight: dimensions.height
    });

    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragState.isDragging) {
        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;
        
        let newY = dragState.startTop + dy;
        if (newY < 0) newY = 0;
        
        setDimensions(prev => ({
          ...prev,
          x: dragState.startLeft + dx,
          y: newY
        }));
      }

      if (resizeState.isResizing) {
        const dx = e.clientX - resizeState.startX;
        const dy = e.clientY - resizeState.startY;
        
        const newWidth = Math.max(minWidth, resizeState.startWidth + dx);
        const newHeight = Math.max(minHeight, resizeState.startHeight + dy);

        setDimensions(prev => ({
          ...prev,
          width: newWidth,
          height: newHeight
        }));
      }
    };

    const handleMouseUp = () => {
      if (dragState.isDragging) {
        setDragState(prev => ({ ...prev, isDragging: false }));
      }
      if (resizeState.isResizing) {
        setResizeState(prev => ({ ...prev, isResizing: false }));
      }
    };

    if (dragState.isDragging || resizeState.isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, resizeState, minWidth, minHeight]);

  return (
    <div
      style={{
        position: 'fixed',
        left: `${dimensions.x}px`,
        top: `${dimensions.y}px`,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        zIndex: zIndex,
        display: 'flex',
        flexDirection: 'column',
        background: '#0d0d18',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        boxShadow: '0 30px 100px rgba(0,0,0,0.8)',
        overflow: 'hidden',
        transition: dragState.isDragging || resizeState.isResizing ? 'none' : 'width 0.1s, height 0.1s, left 0.1s, top 0.1s'
      }}
    >
      <div
        onMouseDown={handleDragStart}
        style={{
          padding: '16px 24px',
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          cursor: 'move',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          userSelect: 'none',
          flexShrink: 0
        }}
      >
        <span style={{ fontSize: '15px', fontWeight: '800', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
          {title}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onMouseDown={e => e.stopPropagation()}>
          {headerActions}
          {onClose && (
            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: '0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'white'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {children}
      </div>

      <div
        onMouseDown={handleResizeStart}
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '20px',
          height: '20px',
          cursor: 'se-resize',
          zIndex: 100,
          background: 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.1) 50%)',
          borderBottomRightRadius: '20px'
        }}
      />
    </div>
  );
};

export default DraggableResizableWindow;
