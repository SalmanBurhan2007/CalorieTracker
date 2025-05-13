import React, { useEffect, useState } from "react";
import "./App.css";
import MainHub from "./components/MainHub";
import Login from "./components/Login"; // Make sure you have Login.js as shown earlier
import { auth } from "./components/firebase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return user ? <MainHub /> : <Login onLogin={setUser} />;
}

export default App;