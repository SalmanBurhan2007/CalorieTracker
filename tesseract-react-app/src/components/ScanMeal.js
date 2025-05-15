import React, { useState } from "react";
import Tesseract from "tesseract.js";

function ScanMeal() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleScan = () => {
    if (!image) return;
    setLoading(true);
    Tesseract.recognize(image, "eng", {
      logger: (info) => console.log(info),
    })
      .then(({ data: { text } }) => {
        setText(text);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error scanning image:", error);
        setLoading(false);
      });
  };

  return (
    <div>
      <h2>Scan Meal</h2>
      <p>Use your camera or upload an image of your food.</p>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {image && <img src={image} alt="Uploaded" style={{ maxWidth: "100%", marginTop: "10px" }} />}
      <button onClick={handleScan} disabled={loading}>
        {loading ? "Scanning..." : "Scan Image"}
      </button>
      {text && (
        <div>
          <h3>Scanned Text:</h3>
          <p>{text}</p>
        </div>
      )}
    </div>
  );
}

export default ScanMeal;