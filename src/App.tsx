import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/library';


const BarcodeScanner = () => {
  const [data, setData] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const webcamRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const codeReader = new BrowserMultiFormatReader();

  // Scanning from Image
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      try {
        const result: Result = await codeReader.decodeFromImageUrl(imageUrl);
        setData(result.getText());
        setErrorMessage(null);
      } catch (err) {
        setErrorMessage('No barcode found or unable to decode.');
        setData(null);
      }
    }
  };

  const startWebcamScan = async () => {
    if (webcamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        webcamRef.current.srcObject = stream;
        webcamRef.current.play();

        codeReader.decodeFromVideoElement(webcamRef.current)
          .then((result: Result) => {
            if (result) {
              setData(result.getText());
              setErrorMessage(null);
            }
          })
          .catch((err) => {
            setErrorMessage('No barcode found or unable to decode.');
            setData(null);
          });
      } catch (err) {
        setErrorMessage('Unable to access the webcam.');
        setData(null);
      }
    }
  };

  const stopWebcamScan = () => {
    if (webcamRef.current && webcamRef.current.srcObject) {
      const stream = webcamRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      webcamRef.current.srcObject = null;
    }
    codeReader.reset();
  };

  // Handle USB Scanner input
  useEffect(() => {
    let barcodeBuffer = '';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        if (barcodeBuffer) {
          // Process scanned data here
          setData(barcodeBuffer);
          console.log('Scanned Barcode:', barcodeBuffer);
          barcodeBuffer = ''; // Clear buffer after processing
        }
      } else {
        // Accumulate data
        barcodeBuffer += event.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div>
      <h2>Barcode Scanner</h2>

      {/* Image Upload */}
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
        />
      </div>

      {/* Webcam */}
      <div>
        <video ref={webcamRef} style={{ width: '500px' }} />
        <button onClick={startWebcamScan}>Start Webcam Scan</button>
        <button onClick={stopWebcamScan}>Stop Webcam Scan</button>
      </div>

      {/* Display Result or Error */}
      {data && <p>Scanned Data: {data}</p>}
      {errorMessage && <p>Error: {errorMessage}</p>}
    </div>
  );
};

export default BarcodeScanner;

