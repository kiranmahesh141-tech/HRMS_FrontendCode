import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout({ setIsAuthenticated }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.setItem("isAuthenticated", "false");

    // Update React state
    if (setIsAuthenticated) setIsAuthenticated(false);

    // Redirect to login page
    navigate("/login");
  }, [navigate, setIsAuthenticated]);

  return <p>Logging out...</p>;
}

export default Logout;
