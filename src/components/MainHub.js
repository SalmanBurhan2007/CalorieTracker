import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import MainPage from "./MainPage";
import Diary from "./Diary";
import LogFood from "./LogFood";
import ScanMeal from "./ScanMeal";
import Login from "./Login";
import "./MainHub.css";
import { getAuth } from "firebase/auth";

// SettingsPopup component
function SettingsPopup({ onClose, onLogout, onEditProfile, onCalorieGoal }) {
  return (
    <div className="settings-popup-overlay">
      <div className="settings-popup">
        <h2>Settings</h2>
        <button className="settings-btn" onClick={onEditProfile}>
          Edit Profile
        </button>
        <button className="settings-btn" onClick={onCalorieGoal}>
          Calorie Goal
        </button>
        <button className="settings-btn logout" onClick={onLogout}>
          Logout
        </button>
        <button className="settings-btn close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

// CalorieGoalPopup component
function CalorieGoalPopup({ onClose, userId, onSave }) {
  const [unit, setUnit] = useState("metric"); // "metric" or "us"
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [calorieGoal, setCalorieGoal] = useState("");
  const [recommended, setRecommended] = useState(null);
  const [saving, setSaving] = useState(false);

  // Calculate recommended calories when all fields are filled
  useEffect(() => {
    let w = parseFloat(weight);
    let h = unit === "metric"
      ? parseFloat(height)
      : (() => {
          // US: height is "ft-in"
          const [ft, inch] = (height || "").split("-").map(Number);
          return ft && !isNaN(ft)
            ? ft * 30.48 + (inch && !isNaN(inch) ? inch * 2.54 : 0)
            : "";
        })();
    let a = parseFloat(age);

    if (w && h && a && (gender === "male" || gender === "female")) {
      // Mifflin-St Jeor Equation
      let bmr =
        gender === "male"
          ? 10 * w + 6.25 * h - 5 * a + 5
          : 10 * w + 6.25 * h - 5 * a - 161;
      // Assume sedentary (x1.2)
      let rec = Math.round(bmr * 1.2);
      setRecommended(rec);
      setCalorieGoal(rec);
    } else {
      setRecommended(null);
      setCalorieGoal("");
    }
  }, [unit, weight, height, age, gender]);

  const handleSave = async () => {
    setSaving(true);
    await setDoc(
      doc(db, "users", userId),
      {
        calorieProfile: {
          calorieGoal,
        },
      },
      { merge: true }
    );
    setSaving(false);
    onSave && onSave({ calorieProfile: { calorieGoal } });
    onClose();
  };

  return (
    <div className="settings-popup-overlay">
      <div className="calorie-goal-popup">
        <h2>Calorie Goal</h2>
        <div className="calorie-goal-content">
          <div>
            <label>
              <input
                type="radio"
                name="unit"
                value="metric"
                checked={unit === "metric"}
                onChange={() => setUnit("metric")}
              />
              Metric (kg, cm)
            </label>
            <label style={{ marginLeft: "1.5em" }}>
              <input
                type="radio"
                name="unit"
                value="us"
                checked={unit === "us"}
                onChange={() => setUnit("us")}
              />
              US (lbs, ft/in)
            </label>
          </div>
          <label>
            <span>Weight ({unit === "metric" ? "kg" : "lbs"})</span>
            <input
              className="calorie-goal-input"
              type="number"
              min="0"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder={unit === "metric" ? "e.g. 70" : "e.g. 154"}
            />
          </label>
          <label>
            <span>
              Height ({unit === "metric" ? "cm" : "ft/in"})
            </span>
            {unit === "metric" ? (
              <input
                className="calorie-goal-input"
                type="number"
                min="0"
                value={height}
                onChange={e => setHeight(e.target.value)}
                placeholder="e.g. 175"
              />
            ) : (
              <span style={{ display: "flex", gap: "0.5em" }}>
                <input
                  className="calorie-goal-input"
                  type="number"
                  min="0"
                  style={{ width: "60px" }}
                  value={height.split("-")[0] || ""}
                  onChange={e =>
                    setHeight(
                      `${e.target.value}-${height.split("-")[1] || ""}`
                    )
                  }
                  placeholder="ft"
                />
                <input
                  className="calorie-goal-input"
                  type="number"
                  min="0"
                  max="11"
                  style={{ width: "60px" }}
                  value={height.split("-")[1] || ""}
                  onChange={e =>
                    setHeight(
                      `${height.split("-")[0] || ""}-${e.target.value}`
                    )
                  }
                  placeholder="in"
                />
              </span>
            )}
          </label>
          <label>
            <span>Age</span>
            <input
              className="calorie-goal-input"
              type="number"
              min="0"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="e.g. 25"
            />
          </label>
          <div>
            <label>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={gender === "male"}
                onChange={() => setGender("male")}
              />
              Male
            </label>
            <label style={{ marginLeft: "1.5em" }}>
              <input
                type="radio"
                name="gender"
                value="female"
                checked={gender === "female"}
                onChange={() => setGender("female")}
              />
              Female
            </label>
          </div>
          {recommended && (
            <div style={{ width: "100%", marginTop: "1em" }}>
              <strong>Recommended Maintenance Calories:</strong>
              <div style={{ margin: "0.5em 0" }}>
                <input
                  className="calorie-goal-input"
                  type="number"
                  min="0"
                  value={calorieGoal}
                  onChange={e => setCalorieGoal(e.target.value)}
                  style={{ width: "120px" }}
                />{" "}
                kcal/day
              </div>
              <small>
                (You can adjust this value before submitting)
              </small>
            </div>
          )}
        </div>
        <button
          className="settings-btn"
          onClick={handleSave}
          disabled={saving || !calorieGoal}
        >
          {saving ? "Saving..." : "Submit"}
        </button>
        <button className="settings-btn close" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function EditProfilePopup({ onClose, currentName, onSave }) {
  const [name, setName] = useState(currentName || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    setSaving(true);
    await setDoc(doc(db, "users", user.uid), { name }, { merge: true });
    setSaving(false);
    onSave({ name });
    onClose();
  };

  return (
    <div className="settings-popup-overlay">
      <div className="edit-profile-popup">
        <h2>Edit Profile</h2>
        <div className="edit-profile-content">
          <label>
            <span>Name</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="edit-profile-input"
            />
          </label>
        </div>
        <button className="settings-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button className="settings-btn close" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function MainHub() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("main");
  const [loggedFoods, setLoggedFoods] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCalorieGoal, setShowCalorieGoal] = useState(false);
  
  const [user, setUser] = useState({
    id: "user123", // Replace with real user ID from auth
    name: "User"
  });

  const addFoodToDiary = (food) => {
    setLoggedFoods((prev) => [...prev, food]);
  };

  const renderPage = () => {
    switch (activePage) {
      case "diary":
        return <Diary loggedFoods={loggedFoods} dailyGoal={user.calorieProfile?.calorieGoal || 2000} />;
      case "log":
        return <LogFood addFoodToDiary={addFoodToDiary} />;
      case "scan":
        return <ScanMeal />;
      default:
        return <MainPage calorieGoal={user.calorieProfile?.calorieGoal} />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-container">
          <h1 className="logo">UmmahWell</h1>
          <img src="/Masjid.png" alt="Masjid" className="masjid-image" />
        </div>
        <div className="user-info">
          <div className="profile-container">
            <span className="user-name">Salaam, {user.name}!</span>
          </div>
          <button
            className="settings-link"
            onClick={() => setShowSettings(true)}
          >
            Settings
          </button>
        </div>
      </header>

      <nav className="nav-bar">
        <button onClick={() => setActivePage("main")}>Home</button>
        <button onClick={() => setActivePage("diary")}>Diary</button>
        <button onClick={() => setActivePage("log")}>Log Food</button>
        <button onClick={() => setActivePage("scan")}>Scan Meal</button>
      </nav>

      <main className="main-section">{renderPage()}</main>

      <footer className="footer">© 2025 UmmahWell Inc.</footer>

      {showSettings && (
        <SettingsPopup
          onClose={() => setShowSettings(false)}
          onLogout={() => {
            setIsLoggedIn(false);
            setShowSettings(false);
          }}
          onEditProfile={() => {
            setShowSettings(false);
            setShowEditProfile(true);
          }}
          onCalorieGoal={() => {
            setShowSettings(false);
            setShowCalorieGoal(true);
          }}
        />
      )}

      {showCalorieGoal && (
        <CalorieGoalPopup
          onClose={() => setShowCalorieGoal(false)}
          userId={user.id}
          onSave={updated => setUser(u => ({ ...u, ...updated }))}
        />
      )}

      {showEditProfile && (
        <EditProfilePopup
          onClose={() => setShowEditProfile(false)}
          currentName={user.name}
          onSave={updated => setUser(u => ({ ...u, ...updated }))}
        />
      )}
    </div>
  );
}

export default MainHub;