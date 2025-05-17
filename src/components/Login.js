import React, { useState } from "react";
import "./Login.css";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password); // Firebase SDK function
       // Clear error on success
      if (onLogin) {
        setError("");
        onLogin(auth.currentUser, false); // Notify parent of successful login
      }
    } catch (err) {
      // Map Firebase error codes to user-friendly messages
      let message = "Login failed. Please try again.";
      console.log(err, err.code);
      if (err.code === "auth/user-not-found") {
        message = "No account found with this email.";
        console.log("No account found with this email.");
      } else if (err.code === "auth/wrong-password") {
        message = "Incorrect password.";
        console.log("Incorrect pass.");
      } else if (err.code === "auth/invalid-email") {
        message = "Invalid email address.";
        console.log("Invalid email.");
      }
      setError(message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      if (onLogin) {
        setError("");
        onLogin(auth.currentUser, true); // Notify parent of successful sign up
      }
    } catch (err) {
      let message = "Sign up failed. Please try again.";
      if (err.code === "auth/email-already-exists") {
        message = "This email is already in use.";
      } else if (err.code === "auth/invalid-email") {
        message = "Invalid email address.";
      } else if (err.code === "auth/weak-password") {
        message = "Password should be at least 6 characters.";
      }
      setError(message);
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">UmmahWell</h1>
      <div className="login-box">
        {error && <div className="login-error">{error}</div>}
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <button onClick={handleLogin} className="login-button">Login</button>
        <button onClick={handleSignUp} className="signup-button">Sign Up</button>
      </div>
    </div>
  );
}

export default Login;