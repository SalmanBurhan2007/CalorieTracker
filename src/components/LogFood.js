import React, { useState } from 'react';
import './LogFood.css';
import { db } from './firebase'; // adjust path if needed
import { getAuth } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const APP_ID = "b6075a03"; // Replace with your Nutritionix Application ID
const API_KEY = "48c559b4bc460dfdb75a2f69335cb943"; // Replace with your Nutritionix API Key

const LogFood = ({ addFoodToDiary }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null); // State for popup
  const [servingSize, setServingSize] = useState("1"); // Store as string

  const fetchNutritionForCommon = async (food) => {
    try {
      const res = await fetch("https://trackapi.nutritionix.com/v2/natural/nutrients", {
        method: "POST",
        headers: {
          "x-app-id": APP_ID,
          "x-app-key": API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: food.food_name })
      });
      const data = await res.json();
      if (data.foods && data.foods[0]) {
        return { ...food, ...data.foods[0] };
      }
    } catch (e) {
      // ignore error, return original food
    }
    return food;
  };

  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);

    const res = await fetch(
      "https://trackapi.nutritionix.com/v2/search/instant?query=" + encodeURIComponent(searchTerm),
      {
        headers: {
          "x-app-id": APP_ID,
          "x-app-key": API_KEY,
          "Content-Type": "application/json"
        }
      }
    );
    const data = await res.json();

    // Fetch nutrition info for all common foods in parallel
    const commonFoods = data.common || [];
    const brandedFoods = data.branded || [];

    const enrichedCommonFoods = await Promise.all(
      commonFoods.map(fetchNutritionForCommon)
    );

    const results = [...enrichedCommonFoods, ...brandedFoods];
    setFoods(results);
    setLoading(false);
  };

  const handleAdd = async (food) => {
    setSelectedFood(food); // Open popup with selected food
    setServingSize("1"); // Reset serving size to "1"
  };

  const confirmAddFood = async () => {
    const servingNum = parseFloat(servingSize);
    if (!servingSize || isNaN(servingNum) || servingNum <= 0) {
      alert("Please enter a valid serving size.");
      return;
    }
    if (addFoodToDiary) addFoodToDiary(selectedFood);

    // Adjust macros based on the serving size
    const adjustedCalories = Math.round((selectedFood.nf_calories || 0) * servingNum);
    const protein = Math.round((selectedFood.full_nutrients?.find(n => n.attr_id === 203)?.value || 0) * servingNum); // Protein (attr_id: 203)
    const fat = Math.round((selectedFood.full_nutrients?.find(n => n.attr_id === 204)?.value || 0) * servingNum);    // Fat (attr_id: 204)
    const carbs = Math.round((selectedFood.full_nutrients?.find(n => n.attr_id === 205)?.value || 0) * servingNum);  // Carbs (attr_id: 205)

    // Add to Firestore for the user
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in to add food.');
        return;
      }
      await addDoc(
        collection(db, 'users', user.uid, 'foods'),
        {
          ...selectedFood,
          nf_calories: adjustedCalories, // Adjusted calories
          protein, // Adjusted protein
          fat,     // Adjusted fat
          carbs,   // Adjusted carbs
          serving_size: servingNum, // Store the serving size
          timestamp: serverTimestamp()
        }
      );
      setSelectedFood(null); // Close popup after adding
    } catch (error) {
      console.error('Error adding food to Firestore:', error);
      alert(error);
    }
  };

  const getCalories = (food) => {
    if (food.nf_calories) return Math.round(food.nf_calories * (parseFloat(servingSize) || 0));
    return "N/A";
  };

  const getServing = (food) => {
    if (food.serving_qty && food.serving_unit) {
      return `${food.serving_qty} ${food.serving_unit}`;
    }
    if (food.serving_unit) {
      return food.serving_unit;
    }
    return "";
  };

  // Helper to get macro value per serving
  const getMacro = (food, attrId) => {
    return Math.round((food.full_nutrients?.find(n => n.attr_id === attrId)?.value || 0) * (parseFloat(servingSize) || 0));
  };

  // Helper to get serving weight in grams
  const getServingWeight = (food) => {
    if (food.serving_weight_grams) {
      return `${food.serving_weight_grams}g`;
    }
    return "";
  };

  return (
    <div className="logfood-container">
      <div className="logfood-search">
        <input
          type="text"
          placeholder="Search for a food..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <h3 className="logfood-history-title">Food List</h3>
      <div className="logfood-history-list">
        {loading ? (
          <div>Loading...</div>
        ) : foods.length === 0 ? (
          <div>No foods found.</div>
        ) : (
          foods.map((food, index) => (
            <div className="logfood-item" key={index}>
              <div>
                <strong>{food.food_name || food.name}</strong>
                <p>{food.brand_name || food.tag_name || ""}</p>
                <p>
                  <span>Calories: {getCalories(food)}</span>
                  <br />
                  <span>Serving: {getServing(food)}</span>
                </p>
              </div>
              <button className="logfood-add-btn" onClick={() => handleAdd(food)}>+</button>
            </div>
          ))
        )}
      </div>

      {selectedFood && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Log Food</h3>
            <p>
              <strong>{selectedFood.food_name || selectedFood.name}</strong>
            </p>
            {/* Serving size info */}
            <p>
              <strong>Serving Size:</strong>{" "}
              {selectedFood.serving_qty || 1} {selectedFood.serving_unit || ""}
              {selectedFood.serving_weight_grams
                ? ` (${selectedFood.serving_weight_grams}g)`
                : ""}
            </p>
            {/* Macronutrient circles */}
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
};

// Helper component for macro circles
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

export default LogFood;