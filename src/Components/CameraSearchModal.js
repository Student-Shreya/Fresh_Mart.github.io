import { Button } from "./ui/button";

import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Loader, ScanLine, Search, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvokeLLM, UploadFile } from '../integrations/Core';
import { createPageUrl } from '../utils';

export default function CameraSearchModal({ onClose }) {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState('');
    const [cameraReady, setCameraReady] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;
        let currentStream = null; // Local variable to hold the stream for cleanup
        
        const getCameraStream = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    } 
                });
                
                if (mounted) {
                    currentStream = mediaStream; // Assign to local variable
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                        videoRef.current.onloadedmetadata = () => {
                            if (mounted) {
                                setCameraReady(true);
                            }
                        };
                    }
                }
            } catch (err) {
                console.error("Camera error:", err);
                if (mounted) {
                    setError('Could not access the camera. Please check permissions.');
                }
            }
        };

        getCameraStream();

        return () => {
            mounted = false;
            // Use the local variable for cleanup to avoid dependency warning
            if (currentStream) { 
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []); // Empty dependency array - effect runs only once on mount

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraReady(false);
    };

    const dataURItoBlob = (dataURI) => {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    };

    const handleScan = async () => {
        if (!videoRef.current || !cameraReady) {
            setError("Camera not ready. Please wait and try again.");
            return;
        }
        
        setIsScanning(true);
        setError('');
        setScanResult('');

        try {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

            const dataUri = canvas.toDataURL('image/jpeg', 0.8);
            
            if (!dataUri || dataUri === 'data:,' || dataUri.length < 100) {
                setError("Failed to capture image. Please try again.");
                setIsScanning(false);
                return;
            }

            const imageBlob = dataURItoBlob(dataUri);
            const imageFile = new File([imageBlob], "scan.jpg", { type: "image/jpeg" });
            
            const { file_url } = await UploadFile({ file: imageFile });

            const result = await InvokeLLM({
                prompt: `Identify the single, primary grocery item in this image. Respond with only the name of the item in lowercase (e.g., 'apple', 'banana', 'milk', 'carrot', 'tomato'). If it's not a common grocery item, respond with 'unknown'.`,
                file_urls: [file_url]
            });

            if (result && result.toLowerCase() !== 'unknown') {
                setScanResult(result);
                // Stop camera immediately after successful scan
                stopCamera();
                // Navigate to search results after showing result
                setTimeout(() => {
                    navigate(createPageUrl("Products") + `?search=${encodeURIComponent(result)}`);
                    onClose();
                }, 2000);
            } else {
                setError("Could not identify a product. Please try again.");
            }
        } catch (err) {
            console.error('Scan error:', err);
            setError('An error occurred during the scan. Please try again.');
        } finally {
            setIsScanning(false);
        }
    };

    const handleClose = () => {
        stopCamera();
        onClose();
    };
    
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.8, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 50 }}
                    className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <Camera className="text-green-600" />
                            Scan a Product
                        </h2>
                        <p className="text-gray-500 mt-1">Center a product in the camera view and press scan.</p>
                    </div>

                    <div className="aspect-video bg-gray-900 relative overflow-hidden">
                        {error && (
                            <div className="absolute inset-0 flex items-center justify-center text-white bg-black/70 p-4 text-center z-10">
                                <div>
                                    <p className="text-lg font-semibold mb-2">⚠️ {error}</p>
                                    <Button onClick={() => setError('')} variant="outline" className="text-white border-white">
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        )}
                        {!cameraReady && !error && (
                            <div className="absolute inset-0 flex items-center justify-center text-white bg-black/70">
                                <div className="text-center">
                                    <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
                                    <p>Starting camera...</p>
                                </div>
                            </div>
                        )}
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                        <AnimatePresence>
                            {isScanning && (
                                <motion.div
                                    initial={{ y: "-100%" }}
                                    animate={{ y: "100%" }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0"
                                >
                                    <div className="h-2 bg-green-400 w-full shadow-[0_0_20px_5px_#34d399]"></div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {scanResult && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 flex items-center justify-center bg-green-600/90 text-white"
                            >
                                <div className="text-center">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 0.5, repeat: 2 }}
                                    >
                                        <Search className="w-16 h-16 mx-auto mb-4" />
                                    </motion.div>
                                    <h3 className="text-3xl font-bold capitalize mb-2">{scanResult}</h3>
                                    <p className="text-green-100">Product identified! Searching...</p>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div className="p-6 bg-gray-50">
                        <Button 
                            onClick={handleScan} 
                            disabled={isScanning || !cameraReady || !!scanResult} 
                            className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                            {isScanning ? (
                                <>
                                    <Loader className="mr-2 h-5 w-5 animate-spin" />
                                    Scanning...
                                </>
                            ) : scanResult ? (
                                <>
                                    <Search className="mr-2 h-5 w-5" />
                                    Found: {scanResult}
                                </>
                            ) : !cameraReady ? (
                                <>
                                    <Camera className="mr-2 h-5 w-5" />
                                    Preparing Camera...
                                </>
                            ) : (
                                <>
                                    <ScanLine className="mr-2 h-6 w-6" />
                                    Scan Product
                                </>
                            )}
                        </Button>
                    </div>
                    
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-4 right-4 rounded-full bg-black/20 hover:bg-black/40 text-white" 
                        onClick={handleClose}
                    >
                        <X />
                    </Button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
