import React, { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // For now, allow any username and password
    onLogin();
  };

  return (
    <div className="login-container">
      <h1 className="login-title">UmmahWell</h1>
      <div className="login-box">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
        <button className="signup-button">Sign Up</button>
      </div>
    </div>
  );
}

export default Login;