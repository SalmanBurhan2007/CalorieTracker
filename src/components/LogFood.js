import React, { useState } from 'react';
import './LogFood.css';

const LogFood = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [history] = useState([
    { name: 'Eggs', details: '72 calories, 1.0 Large' },
    { name: 'Apple', details: '112 calories, 1.0 Large' },
    { name: 'Banana', details: '105 calories, 1.0 Medium' },
    { name: 'Rice', details: '206 calories, 1 cup cooked' },
    { name: 'Chicken Breast', details: '165 calories, 100g' },
  ]);

  const handleAdd = (food) => {
    console.log(`Added: ${food.name}`);
  };

  const filteredHistory = history.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="logfood-container">
      <div className="logfood-search">
        <input
          type="text"
          placeholder="Search for a food..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="logfood-most-recent">Most Recent</span>
      </div>

      <h3 className="logfood-history-title">History</h3>
      <div className="logfood-history-list">
        {filteredHistory.map((food, index) => (
          <div className="logfood-item" key={index}>
            <div>
              <strong>{food.name}</strong>
              <p>{food.details}</p>
            </div>
            <button className="logfood-add-btn" onClick={() => handleAdd(food)}>+</button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default LogFood;