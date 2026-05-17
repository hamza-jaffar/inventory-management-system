import { useEffect } from 'react';

export function useBarcodeScanner(onScan: (barcode: string) => void) {
    useEffect(() => {
        let barcodeBuffer = '';
        let lastKeyTime = Date.now();

        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            const currentTime = Date.now();
            
            if (currentTime - lastKeyTime > 50) {
                barcodeBuffer = '';
            }

            if (e.key === 'Enter') {
                if (barcodeBuffer.length >= 3) {
                    e.preventDefault();
                    e.stopPropagation();
                    const scanned = barcodeBuffer;
                    barcodeBuffer = '';
                    onScan(scanned.trim());
                }
            } else if (e.key.length === 1) {
                barcodeBuffer += e.key;
            }

            lastKeyTime = currentTime;
        };

        // Use capture phase to intercept before inputs process it
        window.addEventListener('keydown', handleGlobalKeyDown, true);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
    }, [onScan]);
}
