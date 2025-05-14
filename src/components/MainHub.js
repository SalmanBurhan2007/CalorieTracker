import React, { useState } from "react";
import MainPage from "./MainPage";
import Diary from "./Diary";
import LogFood from "./LogFood";
import ScanMeal from "./ScanMeal";
import Login from "./Login"; // Make sure you have this component
import "./MainHub.css";

function MainHub() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("main");
  const [loggedFoods, setLoggedFoods] = useState([]);

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
        <h1 className="logo">UmmahWell</h1>
        <img src="/Masjid.png" alt="Masjid" className="masjid-image" />
        <div className="user-info">
          <div className="profile-container">
            <img
              src="/placeholder-profile.png"
              alt="Profile"
              className="profile-picture"
            />
            <span className="user-name">Salaam, User!</span>
          </div>
          <a
            href="#"
            className="logout-link"
            onClick={() => setIsLoggedIn(false)}
          >
            Logout
          </a>
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
    </div>
  );
}

export default MainHub;