import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

interface BarcodeScannerProps {
    onScan: (decodedText: string) => void;
    onClose?: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [hasCameraError, setHasCameraError] = useState(false);

    useEffect(() => {
        if (!isScanning) return;

        scannerRef.current = new Html5QrcodeScanner(
            'reader',
            { fps: 10, qrbox: { width: 250, height: 150 } },
            false
        );

        scannerRef.current.render(
            (decodedText) => {
                onScan(decodedText);
                stopScanning();
            },
            (error) => {
                // Ignore errors as they fire on every frame where barcode is not found
            }
        );

        return () => {
            stopScanning();
        };
    }, [isScanning, onScan]);

    const startScanning = () => {
        setHasCameraError(false);
        setIsScanning(true);
    };

    const stopScanning = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
        }
        setIsScanning(false);
        if (onClose) onClose();
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            {!isScanning ? (
                <Button
                    onClick={startScanning}
                    className="flex w-full items-center gap-2"
                    variant="outline"
                >
                    <Camera className="h-4 w-4" />
                    Start Scanner
                </Button>
            ) : (
                <div className="w-full relative">
                    <div id="reader" className="w-full overflow-hidden rounded-lg border bg-black text-white" />
                    {hasCameraError && (
                        <div className="text-center text-sm text-destructive mt-2">
                            Unable to access camera. Please check permissions.
                        </div>
                    )}
                    <Button
                        onClick={stopScanning}
                        variant="destructive"
                        className="mt-4 w-full"
                    >
                        Cancel Scanning
                    </Button>
                </div>
            )}
        </div>
    );
}
