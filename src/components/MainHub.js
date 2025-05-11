import React, { useState } from "react";
import MainPage from "./MainPage";
import Diary from "./Diary";
import LogFood from "./LogFood";
import ScanMeal from "./ScanMeal";
import "./MainHub.css";

function MainHub() {
  const [activePage, setActivePage] = useState("main");

  const renderPage = () => {
    switch (activePage) {
      case "diary":
        return <Diary />;
      case "log":
        return <LogFood />;
      case "scan":
        return <ScanMeal />;
      default:
        return <MainPage />;
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="logo">UmmahWell</h1>
        <img src="/Masjid.png" alt="Masjid" className="masjid-image" />
        <div className="user-info">
          <div className="profile-container">
            <img
              src="/placeholder-profile.png" /* Replace with actual profile picture URL */
              alt="Profile"
              className="profile-picture"
            />
            <span className="user-name">Salaam, User!</span>
          </div>
          <a href="#" className="logout-link">Logout</a>
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