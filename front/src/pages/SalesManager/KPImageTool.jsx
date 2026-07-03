import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { X, ChevronLeft, ChevronRight, Crop, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

// Set PDF.js worker using unpkg CDN (reliable NPM mirror)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const KPImageTool = ({ file, onConfirm, onCancel }) => {
  const [fileType, setFileType] = useState(''); // 'image' or 'pdf'
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [imageSrc, setImageSrc] = useState('');
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(0);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Crop selection state
  const [cropRect, setCropRect] = useState({ x: 50, y: 50, w: 150, h: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [activeHandle, setActiveHandle] = useState(''); // 'tl', 'tr', 'bl', 'br', 'move'
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, rectX: 0, rectY: 0, rectW: 0, rectH: 0 });

  // Detect file type and load
  useEffect(() => {
    if (!file) return;
    setLoading(true);

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setFileType('pdf');
      loadPdf(file);
    } else {
      setFileType('image');
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  // Load PDF using PDF.js
  const loadPdf = async (pdfFile) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setPageNum(1);
      renderPdfPage(pdf, 1, zoom, rotation);
    } catch (err) {
      console.error('Error loading PDF:', err);
      alert('PDF faylini yuklashda xatolik yuz berdi.');
      onCancel();
    }
  };

  // Render specific PDF page on canvas
  const renderPdfPage = async (pdf, pageNumber, currentZoom, currentRotation) => {
    if (!pdf) return;
    setLoading(true);
    try {
      const page = await pdf.getPage(pageNumber);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      
      // Calculate viewport
      const viewport = page.getViewport({ scale: currentZoom, rotation: currentRotation });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render page
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      await page.render(renderContext).promise;
      setLoading(false);
    } catch (err) {
      console.error('Error rendering page:', err);
    }
  };

  // Re-render page when page, zoom, or rotation changes
  useEffect(() => {
    if (fileType === 'pdf' && pdfDoc) {
      renderPdfPage(pdfDoc, pageNum, zoom, rotation);
    }
  }, [pageNum, zoom, rotation, pdfDoc, fileType]);

  const handleMouseDown = (e, action, handle = '') => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (action === 'move') {
      setIsDragging(true);
      setActiveHandle('move');
    } else if (action === 'resize') {
      setIsResizing(true);
      setActiveHandle(handle);
    }

    setDragStart({
      x: clientX,
      y: clientY,
      rectX: cropRect.x,
      rectY: cropRect.y,
      rectW: cropRect.w,
      rectH: cropRect.h
    });
  };

  // Handles Mouse/Touch move to drag or resize crop box
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging && !isResizing) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const dx = clientX - dragStart.x;
      const dy = clientY - dragStart.y;

      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();

      if (activeHandle === 'move') {
        const nextX = Math.max(0, Math.min(containerRect.width - dragStart.rectW, dragStart.rectX + dx));
        const nextY = Math.max(0, Math.min(containerRect.height - dragStart.rectH, dragStart.rectY + dy));
        setCropRect(prev => ({
          ...prev,
          x: nextX,
          y: nextY
        }));
      } else {
        // Resizing
        let nextX = dragStart.rectX;
        let nextY = dragStart.rectY;
        let nextW = dragStart.rectW;
        let nextH = dragStart.rectH;

        if (activeHandle.includes('r')) {
          nextW = Math.max(20, Math.min(containerRect.width - dragStart.rectX, dragStart.rectW + dx));
        }
        if (activeHandle.includes('b')) {
          nextH = Math.max(20, Math.min(containerRect.height - dragStart.rectY, dragStart.rectH + dy));
        }
        if (activeHandle.includes('l')) {
          const possibleW = dragStart.rectW - dx;
          if (possibleW >= 20) {
            nextX = Math.max(0, dragStart.rectX + dx);
            nextW = dragStart.rectW + (dragStart.rectX - nextX);
          }
        }
        if (activeHandle.includes('t')) {
          const possibleH = dragStart.rectH - dy;
          if (possibleH >= 20) {
            nextY = Math.max(0, dragStart.rectY + dy);
            nextH = dragStart.rectH + (dragStart.rectY - nextY);
          }
        }

        setCropRect({
          x: nextX,
          y: nextY,
          w: nextW,
          h: nextH
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setActiveHandle('');
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isResizing, activeHandle, dragStart]);

  // Execute cropping and export base64
  const handleConfirm = () => {
    const container = containerRef.current;
    if (!container) return;

    const sourceWidth = fileType === 'pdf' ? canvasRef.current.width : imageRef.current.naturalWidth;
    const sourceHeight = fileType === 'pdf' ? canvasRef.current.height : imageRef.current.naturalHeight;

    const displayWidth = container.clientWidth;
    const displayHeight = container.clientHeight;

    // Scale crop selection back to original dimensions
    const scaleX = sourceWidth / displayWidth;
    const scaleY = sourceHeight / displayHeight;

    const cropX = cropRect.x * scaleX;
    const cropY = cropRect.y * scaleY;
    const cropW = cropRect.w * scaleX;
    const cropH = cropRect.h * scaleY;

    // Render cropped portion to temporary canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropW;
    tempCanvas.height = cropH;
    const tempCtx = tempCanvas.getContext('2d');

    if (fileType === 'pdf') {
      tempCtx.drawImage(
        canvasRef.current,
        cropX, cropY, cropW, cropH,
        0, 0, cropW, cropH
      );
    } else {
      tempCtx.drawImage(
        imageRef.current,
        cropX, cropY, cropW, cropH,
        0, 0, cropW, cropH
      );
    }

    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.8);
    onConfirm(dataUrl);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ width: '900px', maxWidth: '95vw', background: '#111827', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>Mahsulot rasmini kesib olish</h3>
            <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>Fayldagi kerakli sohani belgilab qirqib oling.</p>
          </div>
          <button onClick={onCancel} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#9ca3af', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}><X size={20}/></button>
        </div>

        {/* Toolbar */}
        <div style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><ZoomOut size={14}/> Kamaytirish</button>
            <span style={{ color: 'white', fontSize: '12px', minWidth: '40px', textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3.0, z + 0.1))} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><ZoomIn size={14}/> Kattalashtirish</button>
            
            <button onClick={() => setRotation(r => (r + 90) % 360)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '12px' }}><RotateCw size={14}/> Burish</button>
          </div>

          {fileType === 'pdf' && totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button disabled={pageNum <= 1} onClick={() => setPageNum(p => Math.max(1, p - 1))} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: pageNum <= 1 ? '#4b5563' : 'white', padding: '6px', borderRadius: '8px', cursor: pageNum <= 1 ? 'default' : 'pointer' }}><ChevronLeft size={16}/></button>
              <span style={{ color: 'white', fontSize: '13px' }}>Sahifa {pageNum} / {totalPages}</span>
              <button disabled={pageNum >= totalPages} onClick={() => setPageNum(p => Math.min(totalPages, p + 1))} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: pageNum >= totalPages ? '#4b5563' : 'white', padding: '6px', borderRadius: '8px', cursor: pageNum >= totalPages ? 'default' : 'pointer' }}><ChevronRight size={16}/></button>
            </div>
          )}
        </div>

        {/* Viewport Area */}
        <div style={{ flex: 1, padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0b0f19', overflow: 'auto', minHeight: '350px', maxHeight: '60vh', position: 'relative' }}>
          {loading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,15,25,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
              <span style={{ color: '#fbbf24', fontSize: '14px', fontWeight: '600' }}>Yuklanmoqda...</span>
            </div>
          )}

          <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
            {fileType === 'pdf' ? (
              <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%', height: 'auto' }}/>
            ) : (
              <img ref={imageRef} src={imageSrc} alt="" style={{ display: 'block', maxWidth: '100%', height: 'auto', maxHeight: '50vh' }}/>
            )}

            {/* Mask layer & Selection Box */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {/* Box frame shadow simulation */}
              <div style={{
                position: 'absolute',
                left: `${cropRect.x}px`,
                top: `${cropRect.y}px`,
                width: `${cropRect.w}px`,
                height: `${cropRect.h}px`,
                border: '2px solid #fbbf24',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                pointerEvents: 'auto',
                cursor: 'move'
              }}
              onMouseDown={(e) => handleMouseDown(e, 'move')}
              onTouchStart={(e) => handleMouseDown(e, 'move')}
              >
                {/* Resize handles */}
                <div style={{ position: 'absolute', top: -5, left: -5, width: 10, height: 10, background: '#fbbf24', cursor: 'nwse-resize' }} onMouseDown={(e) => handleMouseDown(e, 'resize', 'tl')} onTouchStart={(e) => handleMouseDown(e, 'resize', 'tl')}/>
                <div style={{ position: 'absolute', top: -5, right: -5, width: 10, height: 10, background: '#fbbf24', cursor: 'nesw-resize' }} onMouseDown={(e) => handleMouseDown(e, 'resize', 'tr')} onTouchStart={(e) => handleMouseDown(e, 'resize', 'tr')}/>
                <div style={{ position: 'absolute', bottom: -5, left: -5, width: 10, height: 10, background: '#fbbf24', cursor: 'nesw-resize' }} onMouseDown={(e) => handleMouseDown(e, 'resize', 'bl')} onTouchStart={(e) => handleMouseDown(e, 'resize', 'bl')}/>
                <div style={{ position: 'absolute', bottom: -5, right: -5, width: 10, height: 10, background: '#fbbf24', cursor: 'nwse-resize' }} onMouseDown={(e) => handleMouseDown(e, 'resize', 'br')} onTouchStart={(e) => handleMouseDown(e, 'resize', 'br')}/>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
          <button onClick={onCancel} style={{ height: '44px', padding: '0 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#d1d5db', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            Bekor qilish
          </button>
          <button onClick={handleConfirm} style={{ height: '44px', padding: '0 24px', background: '#fbbf24', border: 'none', borderRadius: '12px', color: '#0f172a', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crop size={16}/> Kesib olish & Saqlash
          </button>
        </div>

      </div>
    </div>
  );
};

export default KPImageTool;
