import React, { useState } from 'react';
import './LogFood.css';

const APP_ID = "b6075a03"; // Replace with your Nutritionix Application ID
const API_KEY = "4ccff94382079bd6a8397289b54db3ac"; // Replace with your Nutritionix API Key

const LogFood = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (!searchTerm) return;
    setLoading(true);

    fetch("https://trackapi.nutritionix.com/v2/search/instant?query=" + encodeURIComponent(searchTerm), {
      headers: {
        "x-app-id": APP_ID,
        "x-app-key": API_KEY,
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        // Combine common and branded foods for display
        const results = [
          ...(data.common || []),
          ...(data.branded || [])
        ];
        setFoods(results);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleAdd = (food) => {
    console.log(`Added: ${food.food_name || food.name}`);
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