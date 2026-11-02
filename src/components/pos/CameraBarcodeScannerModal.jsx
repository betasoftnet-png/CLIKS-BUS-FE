import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Barcode, QrCode, AlertCircle, CheckCircle, RefreshCw, Volume2 } from 'lucide-react';
import { playPosBeep, parseBarcodeOrQr } from '../../utils/barcodeScannerHelper';

export const CameraBarcodeScannerModal = ({
    isOpen,
    onClose,
    onScanProduct,
    lastScannedItem = null
}) => {
    const videoRef = useRef(null);
    const [cameraStream, setCameraStream] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [scanFeedback, setScanFeedback] = useState(null);
    const [hasBarcodeDetector, setHasBarcodeDetector] = useState(false);
    const manualInputRef = useRef(null);
    const animationFrameRef = useRef(null);
    const lastDetectedCodeRef = useRef('');
    const lastDetectedTimeRef = useRef(0);

    // Check BarcodeDetector API availability
    useEffect(() => {
        if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
            setHasBarcodeDetector(true);
        }
    }, []);

    // Start camera stream when modal opens
    useEffect(() => {
        if (!isOpen) {
            stopCamera();
            setScanFeedback(null);
            setManualCode('');
            return;
        }

        startCamera();
        // Focus manual input for barcode gun
        setTimeout(() => {
            manualInputRef.current?.focus();
        }, 150);

        return () => {
            stopCamera();
        };
    }, [isOpen]);

    const startCamera = async () => {
        setCameraError(null);
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setCameraError('Camera access not supported on this device/browser. Use hardware barcode scanner or manual code entry.');
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });

            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.setAttribute('playsinline', 'true');
                await videoRef.current.play();
                setIsDetecting(true);
                startDetectionLoop(videoRef.current);
            }
        } catch (err) {
            console.warn('Camera stream error:', err);
            setCameraError(err.name === 'NotAllowedError' 
                ? 'Camera permission denied. Allow camera access or use a barcode gun.' 
                : 'Unable to access video camera. Please use barcode gun or manual entry.');
        }
    };

    const stopCamera = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setIsDetecting(false);
    };

    // Continuous detector loop using native BarcodeDetector
    const startDetectionLoop = (videoEl) => {
        if (!('BarcodeDetector' in window)) return;

        let detector;
        try {
            detector = new window.BarcodeDetector({
                formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'data_matrix']
            });
        } catch (_) {
            return;
        }

        const detectFrame = async () => {
            if (!videoEl || videoEl.readyState < 2) {
                animationFrameRef.current = requestAnimationFrame(detectFrame);
                return;
            }

            try {
                const barcodes = await detector.detect(videoEl);
                if (barcodes && barcodes.length > 0) {
                    const rawVal = barcodes[0].rawValue;
                    const now = Date.now();
                    // Debounce same code detection within 1.8 seconds to avoid re-scanning the same physical item 100 times in 1 second
                    if (rawVal !== lastDetectedCodeRef.current || (now - lastDetectedTimeRef.current > 1800)) {
                        lastDetectedCodeRef.current = rawVal;
                        lastDetectedTimeRef.current = now;
                        triggerScan(rawVal);
                    }
                }
            } catch (_) {}

            animationFrameRef.current = requestAnimationFrame(detectFrame);
        };

        animationFrameRef.current = requestAnimationFrame(detectFrame);
    };

    const triggerScan = (code) => {
        if (!code) return;
        const result = onScanProduct(code);
        if (result !== false) {
            setScanFeedback({
                type: 'success',
                message: `Successfully Scanned: ${code}`
            });
        } else {
            setScanFeedback({
                type: 'error',
                message: `Code not found in catalog: ${code}`
            });
        }
        setManualCode('');
        manualInputRef.current?.focus();
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        const code = manualCode.trim();
        if (code) {
            triggerScan(code);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(5px)',
                padding: '1rem'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '20px',
                        width: '100%',
                        maxWidth: '520px',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '1rem 1.25rem',
                        background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: 'rgba(255, 255, 255, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Barcode size={22} color="#FFFFFF" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.01em' }}>
                                    Supermarket Barcode / QR Scanner
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.72rem', color: '#A7F3D0', fontWeight: '600' }}>
                                    Point camera or use hardware barcode scanner gun
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                background: 'rgba(255, 255, 255, 0.15)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FFFFFF',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Camera / Video Viewport */}
                    <div style={{
                        position: 'relative',
                        background: '#0F172A',
                        minHeight: '260px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}>
                        {!cameraError ? (
                            <div style={{ position: 'relative', width: '100%', height: '260px' }}>
                                <video
                                    ref={videoRef}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />

                                {/* Targeting Overlay Reticle */}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    pointerEvents: 'none'
                                }}>
                                    <div style={{
                                        width: '220px',
                                        height: '140px',
                                        border: '2px dashed #10B981',
                                        borderRadius: '16px',
                                        boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.45)',
                                        position: 'relative'
                                    }}>
                                        {/* Corner brackets */}
                                        <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '4px solid #10B981', borderLeft: '4px solid #10B981', borderRadius: '4px 0 0 0' }} />
                                        <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: '4px solid #10B981', borderRight: '4px solid #10B981', borderRadius: '0 4px 0 0' }} />
                                        <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #10B981', borderLeft: '4px solid #10B981', borderRadius: '0 0 0 4px' }} />
                                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #10B981', borderRight: '4px solid #10B981', borderRadius: '0 0 4px 0' }} />

                                        {/* Scanning laser line animation */}
                                        <motion.div
                                            animate={{ top: ['5%', '90%', '5%'] }}
                                            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                                            style={{
                                                position: 'absolute',
                                                left: 0,
                                                right: 0,
                                                height: '2px',
                                                background: 'linear-gradient(90deg, transparent, #10B981, transparent)',
                                                boxShadow: '0 0 8px #10B981'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'rgba(0, 0, 0, 0.7)',
                                    color: '#FFFFFF',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.72rem',
                                    fontWeight: '700',
                                    letterSpacing: '0.02em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', animation: 'pulse 1.5s infinite' }} />
                                    Align QR Code / Barcode in frame
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: '#94A3B8' }}>
                                <AlertCircle size={36} color="#F59E0B" style={{ margin: '0 auto 0.75rem' }} />
                                <div style={{ fontSize: '0.88rem', color: '#E2E8F0', fontWeight: '700', marginBottom: '0.35rem' }}>
                                    Hardware Scanner Mode
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94A3B8', maxWidth: '320px', margin: '0 auto' }}>
                                    {cameraError}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Feedback Toast */}
                    {scanFeedback && (
                        <div style={{
                            padding: '0.6rem 1rem',
                            background: scanFeedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                            borderBottom: `1px solid ${scanFeedback.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                            color: scanFeedback.type === 'success' ? '#065F46' : '#991B1B',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            {scanFeedback.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {scanFeedback.message}
                        </div>
                    )}

                    {/* Barcode Gun / Manual Input Bar */}
                    <div style={{ padding: '1.25rem', background: '#F8FAFC' }}>
                        <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Barcode size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                                <input
                                    ref={manualInputRef}
                                    type="text"
                                    data-barcode-scanner="true"
                                    placeholder="Or scan with USB/BT Gun or type code..."
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 0.75rem 0.65rem 2.5rem',
                                        borderRadius: '10px',
                                        border: '1.5px solid #CBD5E1',
                                        fontSize: '0.88rem',
                                        fontWeight: '600',
                                        background: '#FFFFFF',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#10B981'}
                                    onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                                />
                            </div>
                            <button
                                type="submit"
                                style={{
                                    padding: '0 1.25rem',
                                    borderRadius: '10px',
                                    background: '#047857',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    fontWeight: '800',
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                Add to Cart
                            </button>
                        </form>

                        {/* Supermarket Pro Tip */}
                        <div style={{
                            marginTop: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.72rem',
                            color: '#64748B'
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Volume2 size={13} color="#059669" /> POS Sound: Active
                            </span>
                            <span>
                                Press <strong>Enter</strong> or pull scanner trigger
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CameraBarcodeScannerModal;

