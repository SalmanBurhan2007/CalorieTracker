import React, { useState } from 'react';
import './LogFood.css';
import { db } from './firebase'; // adjust path if needed
import { getAuth } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const APP_ID = "3d645e62"; // Replace with your Nutritionix Application ID
const API_KEY = "68ea71e992fa9881ade38300823db61d"; // Replace with your Nutritionix API Key

const LogFood = ({ addFoodToDiary }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);

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
    if (addFoodToDiary) addFoodToDiary(food);

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
          ...food,
          timestamp: serverTimestamp()
        }
      );
    } catch (error) {
      console.error('Error adding food to Firestore:', error);
      alert(error);
    }
  };

  const getCalories = (food) => {
    if (food.nf_calories) return Math.round(food.nf_calories);
    if (food.full_nutrients) {
      const calObj = food.full_nutrients.find(n => n.attr_id === 208);
      if (calObj) return Math.round(calObj.value);
    }
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
    </div>
  );
};

export default LogFood;