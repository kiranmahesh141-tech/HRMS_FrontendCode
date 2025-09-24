import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/logout");
  };

  return <button onClick={handleLogout}>Logout</button>;
}

export default LogoutButton;
