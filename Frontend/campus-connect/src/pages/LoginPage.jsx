import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import '../styles/LoginSignup.css';

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/validate`,
        {
          email: email,
          passwordHash: password,
        }
      );

      if (!response || !response.data) return;

      const user = response.data;

      // Save login info
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userEmail", user.email);

      // Check if profile exists
      const profileCheck = await axios.get(`${API_BASE_URL}/users/profile/find/${user.id}`);

      if (profileCheck.data === false) {
        navigate("/profilecreate");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Check the console.");
    }
  };

  const createAccount = (e) => {
    e.preventDefault();
    navigate("/signup");
  };

  return (
    <div className="page">
      <div className="container">
        <div className="header">
          <div className="text">Login</div>
          <div className="underline"></div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input">
            <label>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="input">
            <label>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="button-container">
            <button type="submit">Login</button>
          </div>
        </form>

        <form onSubmit={createAccount}>
          <div className="button-container">
            <button type="submit">Sign Up</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
