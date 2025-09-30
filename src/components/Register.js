import React, { useState, useEffect } from "react";
import "../styles/Register.css";
import { useNavigate } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: ""
  });
  const [maxDate, setMaxDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Set max DOB (18+ age)
  useEffect(() => {
    const today = new Date();
    const max = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    setMaxDate(max.toISOString().split("T")[0]);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const today = new Date();
    const phoneRegex = /^[0-9]{10}$/;

    // Validate phone
    if (!phoneRegex.test(formData.phone)) {
      return showError("Please enter a valid 10-digit phone number");
    }

    // Validate age
    const dobDate = new Date(formData.dob);
    const age = Math.floor((today - dobDate) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) {
      return showError("You must be at least 18 years old to register");
    }

    try {
      const response = await fetch("http://localhost:8080/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return showError(errorData.message || "Failed to register user");
      }

      const result = await response.json();

      // ✅ Redirect to success page with state
      navigate("/regsucc", { state: { user: result } });

    } catch (error) {
      console.error("Error saving user:", error);
      showError("Failed to register user. Please try again.");
    }
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 3000);
  };

  return (
    <div className="wrapper">
      <div className="logo">Logo</div>

      <div className="container" style={{ maxWidth: "500px", margin: "20px auto", textAlign: "center" }}>
        {errorMessage && (
          <div className="error-toast" style={{ background: "#fee", color: "#c00", padding: "12px", borderRadius: "8px", marginBottom: "10px" }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input className="form-input" type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
          <input className="form-input" type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
          <input className="form-input" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input className="form-input" type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
          <input className="form-input" type="date" name="dob" max={maxDate} value={formData.dob} onChange={handleChange} required />

          <button type="submit" className="register-btn" style={{ padding: "12px", background: "#007bff", color: "#fff", border: "none", borderRadius: "6px" }}>
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
