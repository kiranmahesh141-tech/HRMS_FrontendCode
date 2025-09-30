import "../styles/Dashboard.css";
import Logout from "../components/Logout";
import { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";

function HRDashboard({ setIsAuthenticated }) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [show, setShow] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  // Hide welcome message after 5 sec
  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {show && <h1>Welcome HR</h1>}

      {/* Logout Section */}
      <div>
        {!loggingOut ? (
          <button className="logoutbtn" onClick={() => setLoggingOut(true)}>
            Logout
          </button>
        ) : (
          <Logout setIsAuthenticated={setIsAuthenticated} />
        )}
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="upside">
          <ul className="menu">
            <li>
              <NavLink
                to="profile"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Profile
              </NavLink>
            </li>
            <li>
              <NavLink
                to="Recruit"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Recruitment & Onboarding
              </NavLink>
            </li>
            <li>
              <NavLink
                to="attendance"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Attendance & Leave Management
              </NavLink>
            </li>
            <li>
              <NavLink
                to="exit"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Exit Management & Offboarding
              </NavLink>
            </li>
          </ul>
        </div>

        {/* User Info Section */}
        <div className="user-info">
          <span className="avatar">👤</span>
          <span className="username">{isOpen ? "HR" : ""}</span>
        </div>
      </div>

      {/* Where child routes will render */}
      <Outlet />
    </div>
  );
}

export default HRDashboard;
