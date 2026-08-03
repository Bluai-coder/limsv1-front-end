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
    <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
      <style>{`
        @keyframes scan-beam {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-beam {
          animation: scan-beam 2.5s infinite linear;
        }
      `}</style>
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Dark semi-transparent overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col">
        <div className="flex-1 bg-black/50 backdrop-blur-[2px]" />
        <div className="flex justify-between items-stretch h-64">
          <div className="flex-1 bg-black/50 backdrop-blur-[2px]" />
          <div className="w-64 relative border border-white/20">
            {/* Cutout area */}
          </div>
          <div className="flex-1 bg-black/50 backdrop-blur-[2px]" />
        </div>
        <div className="flex-1 bg-black/50 backdrop-blur-[2px]" />
      </div>

      {/* Scanning overlay frame */}
      {status === 'scanning' && !lastScan && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 relative">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-[#1b4dff] rounded-tl shadow-[0_0_15px_#1b4dff] animate-pulse" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-[#1b4dff] rounded-tr shadow-[0_0_15px_#1b4dff] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-[#1b4dff] rounded-bl shadow-[0_0_15px_#1b4dff] animate-pulse" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-[#1b4dff] rounded-br shadow-[0_0_15px_#1b4dff] animate-pulse" />
            
            {/* Scanning line animation */}
            <div className="absolute left-0 right-0 h-[2px] bg-[#1b4dff] shadow-[0_0_10px_#1b4dff] animate-scan-beam" />
          </div>
        </div>
      )}

      {/* Success flash overlay */}
      {lastScan && (
        <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center pointer-events-none transition-all duration-300">
          <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transform scale-110">
            ✓ Code detected!
          </div>
        </div>
      )}

      {/* Status text */}
      <div className="absolute bottom-6 inset-x-0 text-center pointer-events-none">
        {status === 'starting' && <p className="text-white bg-black/60 px-4 py-2 rounded-full inline-block text-sm">Starting camera...</p>}
        {status === 'scanning' && !lastScan && <p className="text-white bg-black/60 px-4 py-2 rounded-full inline-block text-sm">Point camera at QR code / Barcode</p>}
        {status === 'scanning' && lastScan && <p className="text-green-400 bg-black/60 px-4 py-2 rounded-full inline-block font-medium shadow-lg">✓ Code detected!</p>}
      </div>

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-white text-lg font-medium">Camera Access Denied</p>
          <p className="text-gray-400 text-sm mt-2 max-w-xs">Please allow camera permissions in your browser settings to scan codes.</p>
        </div>
      )}
    </div>
  );
}
