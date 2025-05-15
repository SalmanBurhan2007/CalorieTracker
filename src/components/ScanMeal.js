import React, { useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

function ScanMeal() {
  const videoRef = useRef(null);

  useEffect(() => {
    let codeReader;
    let stream;

    async function enableCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          codeReader = new BrowserMultiFormatReader();
          codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
            if (result) {
              alert("Barcode detected: " + result.getText());
              // ADD FIRESTORE LOGIC HERE
            }
          });
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }
    enableCamera();

    return () => {
      if (codeReader) codeReader.reset();
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <div>
      <h2>Scan Meal</h2>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "100%", maxWidth: 400, borderRadius: 8, border: "1px solid #ccc" }}
      />
    </div>
  );
}

export default ScanMeal;