import "../styles/Dashboard.css";
import Logout from "../components/Logout";
import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import {Recruit} from "./Recruit";

function HRDashboard({ setIsAuthenticated }) {
  const [loggingOut, setLoggingOut] = useState(false);


  const [show, setShow] = useState(true);
  useEffect(() => {
    // Set a timer for 5 seconds
    const timer = setTimeout(() => {
      setShow(false); // Hide after 5 sec
    }, 5000);
    // Cleanup the timer if component unmounts
    return () => clearTimeout(timer);
  }, []);

  //Sidebar
  const [isOpen, setIsOpen] = useState(true);


  return (
    <div >
     { show &&<h1>Welcome HR</h1>}
    <div >
        {!loggingOut ? (
          <button className="logoutbtn" onClick={() => setLoggingOut(true)}>Logout</button>
        ) : (
          <Logout setIsAuthenticated={setIsAuthenticated} />
        )}
      </div>      
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      
        <div className="upside">
           <ul className="menu">
        <li>Profile</li>
        <li>
            <Link to="Recruit">Recruitment & Onboarding</Link>
          </li>
        <li>Attendance & Leave Management</li>
        <li>Exit Management & Offboarding</li>
           </ul>
        </div>
     

      {/* User Info Section */}
    <div className="user-info">
      <span className="avatar">👤</span>
      <span className="username">{isOpen ? "HR" : ""}</span>
    </div>
    </div>
     <Outlet />
    </div>
    
  );
}

export default HRDashboard;
