import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";

function Login({ setIsAuthenticated }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8080/api/login", {
        identifier,
        password,
      });

      const { status, role, id } = res.data;

      if (status?.toLowerCase() !== "success") {
        alert("Invalid credentials!");
        return;
      }

      // Save login info
      localStorage.setItem("role", role);
      localStorage.setItem("userId", id);
      localStorage.setItem("isAuthenticated", "true");

      if (setIsAuthenticated) setIsAuthenticated(true);

      // Redirect based on role
      if (role === "HR") navigate("/hr-dashboard");
      else if (role === "EMP") navigate("/emp-dashboard");
      else navigate("/");
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert(error.response?.data?.status || "Invalid credentials!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="logo">Logo</div>
      <div className="login-container">
        <div style={styles.container} className="login-box">
          <h2>Login</h2>
          <form onSubmit={handleLogin} style={styles.form} className="login-form">
            <input style={{ display: "none" }} />
            <input type="password" style={{ display: "none" }} />

            <input
              type="text"
              placeholder="Username or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              style={styles.input}
              autoComplete="username"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              autoComplete="current-password"
            />

            <button type="submit" style={styles.button} className="login-button">
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p>
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "400px", margin: "auto", padding: "20px", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", fontSize: "16px" },
  button: { padding: "10px", fontSize: "16px", cursor: "pointer" }
};

export default Login;
