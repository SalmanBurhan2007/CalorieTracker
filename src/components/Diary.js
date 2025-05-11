import React, { useState } from 'react';
import './Diary.css';

function Diary() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState(""); // State for the new note input
  const [currentDate, setCurrentDate] = useState(new Date()); // State to manage the current date
  const [caloriesConsumed, setCaloriesConsumed] = useState(700); // Example: Calories consumed
  const dailyGoal = 2000; // Example: Daily calorie goal

  // Function to handle adding a new note
  const addNote = () => {
    if (newNote.trim() !== "") {
      setNotes([...notes, newNote]); // Add the new note to the list
      setNewNote(""); // Clear the input field
    }
  };

  // Function to handle deleting a note
  const deleteNote = (index) => {
    const updatedNotes = notes.filter((_, i) => i !== index); // Remove the note at the given index
    setNotes(updatedNotes);
  };

  // Function to handle moving to the previous day
  const goToPreviousDay = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 1); // Subtract one day
      return newDate;
    });
  };

  // Function to handle moving to the next day
  const goToNextDay = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 1); // Add one day
      return newDate;
    });
  };

  // Format the date to display it nicely
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long', // e.g., "Monday"
      month: 'long', // e.g., "July"
      day: 'numeric', // e.g., "19"
      year: 'numeric', // e.g., "2025"
    });
  };

  // Calculate progress percentage
  const progressPercentage = Math.min((caloriesConsumed / dailyGoal) * 100, 100);

  return (
    <div className="diary-container">
      {/* Main Content */}
      <main className="main-diary">
        <div className="progress-section">
          <div className="progress-header">
            <h2>Progress</h2>
            <div className="date-controls">
              <button onClick={goToPreviousDay}>&lt;</button>
              <strong>{formatDate(currentDate)}</strong>
              <button onClick={goToNextDay}>&gt;</button>
            </div>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-info">
            <span>Calories Consumed: {caloriesConsumed} cal</span>
            <span>Daily Goal: {dailyGoal} cal</span>
          </div>
        </div>

        <div className="notes-section">
          <div className="notes-header">
            <h2>Notes</h2>
            <div className="date-controls">
              <button onClick={goToPreviousDay}>&lt;</button>
              <strong>{formatDate(currentDate)}</strong>
              <button onClick={goToNextDay}>&gt;</button>
            </div>
          </div>
          <div className="notes-box">
            <ul>
              {notes.map((note, index) => (
                <li key={index}>
                  <strong>{note}</strong>
                  <button onClick={() => deleteNote(index)} className="delete-btn">X</button>
                </li>
              ))}
            </ul>
            <div className="add-note">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addNote(); // Call the addNote function when Enter is pressed
                  }
                }}
                placeholder="Add a new note"
              />
              <button onClick={addNote}>Add</button>
            </div>
          </div>
        </div>
      </main>

      {/* Food Log */}
      <section className="food-log">
        <h3>Food Logged today</h3>
        <h4>Breakfast</h4>
        <div className="food-item">
          <strong>Eggs</strong>
          <p>72 calories, 1.0 Large</p>
        </div>
        <div className="food-item">
          <strong>Apple</strong>
          <p>112 calories, 1.0 Large</p>
        </div>
        <div className="total-cal">
          <strong>194 Cal.</strong>
        </div>
      </section>

    </div>
  );
}

export default Diary;