import React, { useState, useEffect, useRef } from 'react';

interface CameraScannerProps {
  onScan: (decodedText: string) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  lastScannedPrn: string | null;
}

declare global {
  interface Window {
    Html5Qrcode?: any;
    Html5QrcodeSupportedFormats?: any;
  }
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onScan,
  isScanning,
  setIsScanning,
  lastScannedPrn,
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = useRef<any>(null);
  const lastScanTimeRef = useRef<number>(0);

  // Check if html5-qrcode is loaded in window
  useEffect(() => {
    const checkLib = () => {
      if (window.Html5Qrcode) {
        setScannerReady(true);
      } else {
        setTimeout(checkLib, 200);
      }
    };
    checkLib();
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    if (!window.Html5Qrcode) {
      setCameraError('Scanner library is loading, please retry in a second.');
      return;
    }

    try {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch {
          // ignore
        }
      }

      const html5QrCode = new window.Html5Qrcode('qr-reader-container');
      scannerRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 280, height: 180 },
        aspectRatio: 1.333333,
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText: string) => {
          const now = Date.now();
          // Debounce same barcode within 1.5 seconds
          if (now - lastScanTimeRef.current > 1500) {
            lastScanTimeRef.current = now;
            onScan(decodedText.trim());
          }
        },
        () => {
          // parse frame failure (ignore)
        }
      );

      setIsCameraActive(true);
      setIsScanning(true);
    } catch (err: any) {
      console.warn('Camera initialization error:', err);
      setIsCameraActive(false);
      setIsScanning(false);
      setCameraError(
        err?.message || 'Unable to access webcam. Please check browser permissions or use manual PRN input.'
      );
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setIsCameraActive(false);
    setIsScanning(false);
  };

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current = null;
        });
      }
    };
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header & Status Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-base font-bold">
            📷
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Live Barcode & QR Scanner</span>
              {isCameraActive ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                  Live View
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                  Standby
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">Position student ID card barcode in front of webcam</p>
          </div>
        </div>

        {/* Start / Stop Camera Toggle Button */}
        <div>
          {isCameraActive ? (
            <button
              onClick={stopCamera}
              className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl text-xs font-semibold transition active:scale-95 flex items-center gap-1.5"
            >
              <span>⏹</span>
              <span>Stop Camera</span>
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition active:scale-95 flex items-center gap-1.5"
            >
              <span>▶</span>
              <span>Start Camera Scanner</span>
            </button>
          )}
        </div>
      </div>

      {/* Camera Viewport Window */}
      <div className="relative w-full aspect-video sm:h-72 bg-slate-950 rounded-xl overflow-hidden border-2 border-slate-800 flex items-center justify-center">
        {/* Html5Qrcode video mounting target */}
        <div id="qr-reader-container" className="w-full h-full object-cover"></div>

        {/* Viewfinder Target & Laser Overlay (Visible when camera is active) */}
        {isCameraActive && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
            {/* Viewfinder targeting box */}
            <div className="relative w-64 sm:w-72 h-40 sm:h-44 border-2 border-dashed border-blue-400/70 rounded-xl shadow-2xl flex items-center justify-center">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-md"></div>
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-md"></div>
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-md"></div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-md"></div>

              {/* Animated Laser Scanning Beam */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse"></div>

              <span className="text-[11px] font-semibold text-emerald-300 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Align PRN Barcode Here
              </span>
            </div>
          </div>
        )}

        {/* Standby / Inactive Overlay */}
        {!isCameraActive && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl text-blue-400 shadow-inner">
              📷
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Camera Scanner Inactive</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                Click "Start Camera Scanner" to enable live webcam recognition, or use the quick simulation & text backup below.
              </p>
            </div>
            <button
              onClick={startCamera}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition active:scale-95"
            >
              Enable Live Webcam
            </button>
          </div>
        )}

        {/* Error Notification inside camera viewport */}
        {cameraError && (
          <div className="absolute bottom-3 inset-x-3 bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs p-3 rounded-xl flex items-center gap-2">
            <span className="text-base">⚠</span>
            <span className="flex-1">{cameraError}</span>
            <button
              onClick={() => setCameraError(null)}
              className="text-rose-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Last scanned toast banner */}
        {lastScannedPrn && (
          <div className="absolute top-3 left-3 right-3 bg-slate-900/90 border border-blue-500/40 px-3 py-1.5 rounded-lg flex items-center justify-between text-xs animate-fade-in">
            <span className="text-slate-300">
              Scanned Raw PRN: <strong className="text-emerald-400 font-mono">{lastScannedPrn}</strong>
            </span>
            <span className="text-emerald-400 font-bold">✓ Captured</span>
          </div>
        )}
      </div>
    </div>
  );
};
