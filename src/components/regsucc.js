
import { useLocation, Link } from "react-router-dom";
import "../styles/Register.css"

function RegSuccess() {
  const location = useLocation();
  const { user } = location.state || {}; // Get user data passed from Register

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      {user ? (
        <>
          <div style={{ padding: "20px", background: "#e6ffe6", borderRadius: "10px" }}>
            <h2>Registration Successful 🎉</h2>
            <p>
              Welcome <b>{user.firstName} {user.lastName}</b>! Your registration has been done.
            </p>
          </div>

          <Link to="/login">
            <button
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                background: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Go to Login
            </button>
          </Link>
        </>
      ) : (
        <p>No registration data found.</p>
      )}
    </div>
  );
}

export default RegSuccess;
