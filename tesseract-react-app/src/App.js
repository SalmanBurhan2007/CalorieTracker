import React from "react";
import ScanMeal from "./components/ScanMeal";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Tesseract OCR React App</h1>
      </header>
      <main>
        <ScanMeal />
      </main>
    </div>
  );
}

export default App;