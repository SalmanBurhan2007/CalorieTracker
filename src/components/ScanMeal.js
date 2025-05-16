import React, { useRef, useEffect, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { getAuth } from "firebase/auth";

const APP_ID = "3d645e62";
const API_KEY = "68ea71e992fa9881ade38300823db61d";

function ScanMeal({ addFoodToDiary }) {
  const videoRef = useRef(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [servingSize, setServingSize] = useState("1");
  //const [cameraActive, setCameraActive] = useState(false);

  // MacroCircle helper from LogFood.js
  function MacroCircle({ label, value, color, unit }) {
    return (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: "#f5f5f5",
            border: `3px solid ${color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            fontWeight: "bold",
            fontSize: 18,
            color: color,
          }}
        >
          {value}{unit}
        </div>
        <div style={{ marginTop: 6, fontSize: 14, color: "#333" }}>{label}</div>
      </div>
    );
  }

  // Helper for macros
  const getMacro = (food, attrId) => {
    return Math.round((food.full_nutrients?.find(n => n.attr_id === attrId)?.value || 0) * (parseFloat(servingSize) || 0));
  };

  // Helper for calories
  const getCalories = (food) => {
    if (food.nf_calories) return Math.round(food.nf_calories * (parseFloat(servingSize) || 0));
    return "N/A";
  };

  // --- Boycott and Haram logic from LogFood.js ---
  const haramIngredients = [
    "gelatin",
    "marshmallow",
    "rice krispies",
    "lard",
    "pork",
    "bacon",
    "ham",
    "rum",
    "beer",
    "wine",
    "ethanol",
    "vanilla extract",
    "carmine",
    "cochineal",
    "pepsin",
    "rennet",
    "shortening (animal)",
    "animal fat",
    "emulsifier (animal)",
    "enzymes (porcine)",
    "lipase (porcine)",
    "monoglycerides (animal)",
    "diglycerides (animal)"
  ];

  const companies = [
    "tim hortons", "starbucks", "nestle", "coca cola", "pepsi", "kraft", "mondelez", "unilever", "procter & gamble",
    "general mills", "campbell's soup", "7up", "mcdonald's", "burger king", "kfc", "pizza hut", "domino's pizza", "sodastream"
  ];

  const normalize = str =>
    (str || "")
      .replace(/\([^)]*\)/g, '') // Remove anything in brackets ()
      .replace(/[^\w\s]/gi, '')  // Remove non-word characters
      .toLowerCase()
      .trim();

  const handleAdd = async (food) => {
    // Boycott check
    const foodBrand = food.brand_name ? normalize(food.brand_name) : "";
    const foodName = food.food_name ? normalize(food.food_name) : "";

    const isBoycotted = companies.some(company => {
      const normalizedCompany = normalize(company);
      const regex = new RegExp(`\\b${normalizedCompany}\\b`, 'i');
      return regex.test(foodBrand) || regex.test(foodName);
    });

    if (isBoycotted) {
      alert("Warning: This food is produced by a company on the boycott list.");
    }

    // Haram check
    if (food.brand_name) {
      if (food.ingredients) {
        const ingredientsStr = food.ingredients.toLowerCase();
        const foundHaram = haramIngredients.find(haram =>
          ingredientsStr.includes(haram)
        );
        if (foundHaram) {
          alert(`Warning: This food contains a haram ingredient: ${foundHaram}`);
        }
      } else {
        alert("This branded food does not have an ingredients list. Please verify yourself if it is halal.");
      }
    }

    setSelectedFood(food);
    setServingSize("1");
  };

  const confirmAddFood = async () => {
    const servingNum = parseFloat(servingSize);
    if (!servingSize || isNaN(servingNum) || servingNum <= 0) {
      alert("Please enter a valid serving size.");
      return;
    }
    if (addFoodToDiary) addFoodToDiary(selectedFood);

    // Firestore logic (similar to LogFood.js)
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");
      const userId = user.uid;

      const foodToSave = {
      ...selectedFood,
      servingSize: servingNum,
      date: new Date().toISOString().slice(0, 10)
      };

      // Lazy load Firestore to avoid import at top
      const { getFirestore, collection, addDoc } = await import("firebase/firestore");
      const { getApp } = await import("firebase/app");
      const db = getFirestore(getApp());

      await addDoc(collection(db, "users", userId, "foods"), foodToSave);
    } catch (err) {
      console.error("Error saving food to Firestore:", err);
    }

    setSelectedFood(null); // Close popup after adding
  };

  useEffect(() => {
    let codeReader;
    let stream;

    async function enableCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          codeReader = new BrowserMultiFormatReader();
          codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
            if (result) {
              fetch(`https://trackapi.nutritionix.com/v2/search/item?upc=${result.getText()}`, {
                headers: {
                  "x-app-id": APP_ID,
                  "x-app-key": API_KEY,
                  "Content-Type": "application/json"
                }
              })
                .then(res => res.json())
                .then(data => {
                  if (data && data.foods && data.foods.length > 0) {
                    handleAdd(data.foods[0]);
                  } else {
                    alert("No food found for this UPC.");
                  }
                })
                .catch(err => {
                  console.error("Nutritionix API error:", err);
                  alert("Error fetching food info.");
                });
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

      {selectedFood && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Log Food</h3>
            <p>
              <strong>{selectedFood.food_name || selectedFood.name}</strong>
            </p>
            <p>
              <strong>Serving Size:</strong>{" "}
              {selectedFood.serving_qty || 1} {selectedFood.serving_unit || ""}
              {selectedFood.serving_weight_grams
                ? ` (${selectedFood.serving_weight_grams}g)`
                : ""}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, margin: "16px 0" }}>
              <MacroCircle
                label="Protein"
                value={getMacro(selectedFood, 203)}
                color="#4caf50"
                unit="g"
              />
              <MacroCircle
                label="Carbs"
                value={getMacro(selectedFood, 205)}
                color="#2196f3"
                unit="g"
              />
              <MacroCircle
                label="Fat"
                value={getMacro(selectedFood, 204)}
                color="#ff9800"
                unit="g"
              />
            </div>
            <p>Calories: {getCalories(selectedFood)}</p>
            <div>
              <label htmlFor="serving-size">Serving Size:</label>
              <input
                id="serving-size"
                type="number"
                min="0.1"
                step="0.1"
                value={servingSize}
                onChange={e => setServingSize(e.target.value)}
              />
            </div>
            <div className="popup-actions">
              <button onClick={() => setSelectedFood(null)}>Cancel</button>
              <button onClick={confirmAddFood}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScanMeal;