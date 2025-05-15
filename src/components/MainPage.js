import React from "react";
import "./MainPage.css";

function MainPage({ loggedFoods = [] }) {
  const baseGoal = 2000;

  // Sum calories from all logged foods for the day
  const foodCalories = loggedFoods.reduce((total, food) => {
    // Assume each food item has a 'calories' property
    return total + (food.calories || 0);
  }, 0);

  const remainingCalories = baseGoal - foodCalories;

  return (
    <div className="main-page">
      <h2 className="date-title">{new Date().toDateString()}</h2>
      <h2 className="streak-title">DAY <br />STREAK</h2>
      <div className="cards">
        <div className="card">
          <h3>Calories</h3>
          <div className="calories-container">
            {/* Left: Calories Remaining */}
            <div className="calories-circle">
              <span className="calories-amount">{remainingCalories}</span>
              <p className="label">Remaining</p>
            </div>

            {/* Right: Base Goal and Food */}
            <div className="calories-details">
              <div>
                <strong>Base Goal:</strong> {baseGoal} cal
              </div>
              <div>
                <strong>Food:</strong> {foodCalories} cal
              </div>
            </div>
          </div>
        </div>

        <div className="card macros-card">
          <h3>Macros</h3>
          <div className="macros-details">
            <div className="macro-item">
              <span className="macro-label">Protein:</span>
              <span className="macro-value">50g left</span>
            </div>
            <div className="macro-item">
              <span className="macro-label">Carbs:</span>
              <span className="macro-value">200g left</span>
            </div>
            <div className="macro-item">
              <span className="macro-label">Fat:</span>
              <span className="macro-value">70g left</span>
            </div>
          </div>
        </div>
      </div>

      <div className="quote-section">
        <h4>Daily Islamic Quote</h4>
        <blockquote>
          "The world is but a moment, so make it a moment of obedience."
        </blockquote>
      </div>
    </div>
  );
}

export default MainPage;