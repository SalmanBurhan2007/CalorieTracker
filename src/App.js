import React, { useEffect, useState } from "react";
import "./App.css";
import MainHub from "./components/MainHub";
import Login from "./components/Login";
import { auth, db } from "./components/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, getAuth } from "firebase/auth";

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

  // This function will be called by Login after successful login/signup
  const handleAuth = async (authUser, isSignup = false) => {
    // Fetch user profile from Firestore
    const userDoc = await getDoc(doc(db, "users", authUser.uid));
    if (userDoc.exists()) {
      setUser({ ...authUser, ...userDoc.data() });
    } else {
      setUser(authUser); // fallback if no profile
    }
    // Optionally, you can handle isSignup here for calorie goal popup
  };

  if (loading) return <div>Loading...</div>;

  return user ? <MainHub user={user} setUser={setUser} /> : <Login onLogin={handleAuth} />;
}

export default App;