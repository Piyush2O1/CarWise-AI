import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("token"))
  );

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem("token")));
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo">
        � <span>CarWise AI</span>
      </div>

      <div className="nav-links">
        <a href="#how-it-works">How It Works</a>

        <a href="#features">Features</a>

        {isAuthenticated ? (
          <>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => navigate("/signup")}
            >
              Signup
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;