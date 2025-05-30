import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, X, Check, RotateCcw } from "lucide-react";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export default function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);

        // Simulate barcode detection after 3 seconds for demo
        // In a real implementation, you would use a barcode scanning library
        setTimeout(() => {
          const mockBarcode = generateMockBarcode();
          setScannedCode(mockBarcode);
          setIsScanning(false);
          stopCamera();
        }, 3000);
      }
    } catch (err) {
      setError('Não foi possível acessar a câmera. Verifique as permissões.');
      console.error('Camera access error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const generateMockBarcode = () => {
    // Generate a realistic barcode for demo purposes
    const prefixes = ['789', '780', '790'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 1000000000).toString().padStart(10, '0');
    return prefix + number;
  };

  const handleUseCode = () => {
    if (scannedCode) {
      onScan(scannedCode);
      handleClose();
    }
  };

  const handleScanAgain = () => {
    setScannedCode(null);
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    setScannedCode(null);
    setError(null);
    onClose();
  };

  useEffect(() => {
    if (isOpen && !isScanning && !scannedCode && !error) {
      // Auto-start camera when modal opens
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Check if browser supports camera
  const isCameraSupported = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Camera className="mr-2 h-5 w-5" />
            Escanear Código de Barras
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isCameraSupported ? (
            <div className="text-center p-8">
              <p className="text-red-600 mb-4">
                Câmera não suportada neste dispositivo/navegador
              </p>
              <Button onClick={handleClose}>
                Fechar
              </Button>
            </div>
          ) : error ? (
            <div className="text-center p-8">
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-x-2">
                <Button onClick={startCamera} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>
                <Button onClick={handleClose}>
                  Fechar
                </Button>
              </div>
            </div>
          ) : scannedCode ? (
            <div className="text-center p-8">
              <div className="p-4 bg-green-100 text-green-800 rounded-lg mb-4">
                <p className="font-medium">Código encontrado:</p>
                <p className="text-lg font-bold mt-2">{scannedCode}</p>
              </div>
              <div className="space-x-2">
                <Button onClick={handleUseCode} className="bg-primary hover:bg-blue-700">
                  <Check className="mr-2 h-4 w-4" />
                  Usar Este Código
                </Button>
                <Button onClick={handleScanAgain} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Escanear Novamente
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-4 relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg border-2 border-dashed border-gray-300"
                  style={{ maxHeight: '300px' }}
                />
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm font-medium">Procurando código...</p>
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Posicione o código de barras dentro do quadro
              </p>
              
              <div className="space-x-2">
                {!isScanning && (
                  <Button onClick={startCamera} className="bg-secondary hover:bg-green-700">
                    <Camera className="mr-2 h-4 w-4" />
                    Iniciar Scanner
                  </Button>
                )}
                <Button onClick={handleClose} variant="outline">
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
