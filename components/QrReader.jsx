'use client';
// frontend/src/components/inventory/QrReader.jsx
// Camera-based QR/Barcode scanner using jsQR

import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

export default function QrReader({ onScan, onError }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('starting');
  const [lastScan, setLastScan] = useState(null);

  useEffect(() => {
    let active = true;

const startCamera = async () => {
  try {
    // 🔐 Safety check
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("Camera not supported or insecure context");
      setStatus("error");
      onError?.(new Error("Camera not supported"));
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });

    if (!active) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }

    streamRef.current = stream;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;

      // ✅ Important for mobile
      videoRef.current.setAttribute("playsinline", true);

      await videoRef.current.play();
      setStatus("scanning");
      scanFrame();
    }
  } catch (err) {
    console.error("Camera error:", err);
    setStatus("error");
    onError?.(err);
  }
};

    const scanFrame = () => {
      if (!active) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== 4) {
        rafRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data !== lastScan) {
        setLastScan(code.data);
        onScan(code.data);
        // Draw detection box
        drawBox(ctx, code.location);
        // Debounce: pause scanning for 1.5s after successful scan
        setTimeout(() => {
          setLastScan(null);
          if (active) rafRef.current = requestAnimationFrame(scanFrame);
        }, 1500);
        return;
      }

      rafRef.current = requestAnimationFrame(scanFrame);
    };

    startCamera();

    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  function drawBox(ctx, location) {
    if (!location) return;
    ctx.beginPath();
    ctx.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
    ctx.lineTo(location.topRightCorner.x, location.topRightCorner.y);
    ctx.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
    ctx.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
    ctx.closePath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#10b981';
    ctx.stroke();
  }

  return (
    <div className="relative w-full bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Scanning overlay */}
      {status === 'scanning' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 relative">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-white rounded-br" />
            {/* Scanning line animation */}
            <div className="absolute inset-x-1 top-0 h-0.5 bg-emerald-400 animate-bounce" style={{ animationDuration: '2s' }} />
          </div>
        </div>
      )}

      {status === 'starting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <p className="text-white text-sm">Starting camera...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 p-4">
          <p className="text-white text-sm font-medium">Camera not available</p>
          <p className="text-red-200 text-xs mt-1">Please use USB scanner or check permissions</p>
        </div>
      )}

      {lastScan && (
        <div className="absolute bottom-0 inset-x-0 bg-emerald-500/90 p-3 text-center">
          <p className="text-white text-sm font-medium">✓ Code detected! Processing...</p>
        </div>
      )}
    </div>
  );
}
