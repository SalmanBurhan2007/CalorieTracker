import React, { useState, useEffect } from 'react';
import './Diary.css';
import { db } from './firebase';
import { getAuth } from 'firebase/auth';
import { collection, query, where, onSnapshot, deleteDoc, doc, addDoc, Timestamp } from 'firebase/firestore';

function Diary({ dailyGoal = 2000 }) { // Accept dailyGoal as a prop, fallback to 2000
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [foodLog, setFoodLog] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setFoodLog([]);
      setCaloriesConsumed(0);
      setNotes([]);
      return;
    }

    // Get start and end of the current day
    const start = new Date(currentDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(currentDate);
    end.setHours(23, 59, 59, 999);

    // Food log query
    const foodsRef = collection(db, 'users', user.uid, 'foods');
    const q = query(
      foodsRef,
      where('timestamp', '>=', Timestamp.fromDate(start)),
      where('timestamp', '<=', Timestamp.fromDate(end))
    );

    const unsubscribeFoods = onSnapshot(q, (snapshot) => {
      const foods = [];
      let totalCalories = 0;
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        foods.push({ ...data, id: docSnap.id }); // Attach Firestore doc id
        if (data.nf_calories !== undefined) {
          totalCalories += Math.round(data.nf_calories);
        } else if (data.details) {
          const match = data.details.match(/(\d+)\s*calories/i);
          if (match) {
            totalCalories += parseInt(match[1], 10);
          }
        }
      });
      setFoodLog(foods);
      setCaloriesConsumed(totalCalories);
    });

    // Notes query for the current day
    const notesRef = collection(db, 'users', user.uid, 'notes');
    const notesQ = query(
      notesRef,
      where('date', '>=', Timestamp.fromDate(start)),
      where('date', '<=', Timestamp.fromDate(end))
    );

    const unsubscribeNotes = onSnapshot(notesQ, (snapshot) => {
      const notesArr = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.text) notesArr.push({ ...data, id: docSnap.id });
      });
      setNotes(notesArr);
    });

    return () => {
      unsubscribeFoods();
      unsubscribeNotes();
    };
  }, [currentDate]);

  // Delete food item from Firestore
  const handleDeleteFood = async (foodId) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
      await deleteDoc(doc(db, 'users', user.uid, 'foods', foodId));
    } catch (error) {
      alert('Failed to delete food item.');
      console.error(error);
    }
  };

  // Add a new note to Firestore for the current date
  const addNote = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || newNote.trim() === "") return;
    try {
      await addDoc(
        collection(db, 'users', user.uid, 'notes'),
        {
          text: newNote.trim(),
          date: Timestamp.fromDate(new Date(currentDate))
        }
      );
      setNewNote("");
    } catch (error) {
      alert('Failed to add note.');
      console.error(error);
    }
  };

  // Delete a note from Firestore
  const deleteNote = async (noteId) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'notes', noteId));
    } catch (error) {
      alert('Failed to delete note.');
      console.error(error);
    }
  };

  // Function to handle moving to the previous day
  const goToPreviousDay = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  // Function to handle moving to the next day
  const goToNextDay = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  // Format the date to display it nicely
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
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
              {notes.map((note) => (
                <li key={note.id}>
                  <strong>{note.text}</strong>
                  <button onClick={() => deleteNote(note.id)} className="delete-btn">X</button>
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
                    addNote();
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
        {foodLog.length === 0 ? (
          <div>No food logged for this day.</div>
        ) : (
          foodLog.map((food, idx) => (
            <div className="food-item" key={food.id || idx}>
              <strong>{food.food_name || food.name}</strong>
              <p>
                {food.nf_calories !== undefined
                  ? `${Math.round(food.nf_calories)} calories`
                  : ""}
                {food.serving_qty && food.serving_unit
                  ? `, ${food.serving_qty} ${food.serving_unit}`
                  : ""}
              </p>
              <button
                className="delete-btn"
                onClick={() => handleDeleteFood(food.id)}
                style={{ marginLeft: 8, backgroundColor: "red", color: "white" }}
              >
                X
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default Diary;