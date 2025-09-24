import Logout from "../components/Logout";
import "../styles/Dashboard.css";
import { useState } from "react";

function EmpDashboard({ setIsAuthenticated }) {
  const [loggingOut, setLoggingOut] = useState(false);
 return (
    <div>
      <h1>Welcome Employee</h1>
      
      <div >
        {!loggingOut ? (
          <button className="logoutbtn" onClick={() => setLoggingOut(true)}>Logout</button>
        ) : (
          <Logout setIsAuthenticated={setIsAuthenticated} />
        )}
      </div>
     
    </div>
  );
}
export default EmpDashboard;