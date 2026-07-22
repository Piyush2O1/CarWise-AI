import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name,
          email,
          password,
        }
      );

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">
          🚗 CarWise AI
        </div>

        <h1>
          Create Account
        </h1>

        <p className="login-subtitle">
          Start analyzing your vehicle contracts
        </p>

        <form onSubmit={handleSignup}>

          <label htmlFor="name">
            Full Name
          </label>

          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            required
          />

          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            minLength="6"
            required
          />

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {success && (
            <p className="success-message">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>


        <p className="auth-switch">
  Already have an account?{" "}
  <Link to="/login">
    Login
  </Link>
</p>

        <button
          className="back-button"
          onClick={() => navigate("/login")}
        >
          Login
        </button>

      </div>

    </div>
  );
}

export default Signup;