import React, { useState } from "react";
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import MainPage from "./MainPage";
import Diary from "./Diary";
import LogFood from "./LogFood";
import ScanMeal from "./ScanMeal";
import Login from "./Login";
import "./MainHub.css";

// SettingsPopup component
function SettingsPopup({ onClose, onLogout, onEditProfile }) {
  return (
    <div className="settings-popup-overlay">
      <div className="settings-popup">
        <h2>Settings</h2>
        <button className="settings-btn" onClick={onEditProfile}>
          Edit Profile
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

function EditProfilePopup({ onClose, userId, currentName, onSave }) {
  const [name, setName] = useState(currentName || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await setDoc(doc(db, "users", userId), { name }, { merge: true });
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
        return <Diary loggedFoods={loggedFoods} />;
      case "log":
        return <LogFood addFoodToDiary={addFoodToDiary} />;
      case "scan":
        return <ScanMeal />;
      default:
        return <MainPage />;
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
        />
      )}

      {showEditProfile && (
        <EditProfilePopup
          onClose={() => setShowEditProfile(false)}
          userId={user.id}
          currentName={user.name}
          onSave={updated => setUser(u => ({ ...u, ...updated }))}
        />
      )}
    </div>
  );
}

export default MainHub;