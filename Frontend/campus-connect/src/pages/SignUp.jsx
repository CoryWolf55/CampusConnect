import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../styles/LoginSignup.css'; // reuse the same CSS

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const saveLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/register",
        {
          email: email,
          passwordHash: password,
        }
      );

      if (response.data === true) {
        navigate("/");
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Check the console.");
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="header">
          <div className="text">Sign Up</div>
        </div>

        <form onSubmit={saveLogin}>
  <div className="input">
    <label>Email:</label>
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
  </div>

  <div className="input">
    <label>Password:</label>
    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
  </div>

  <div className="button-row">
    <button type="submit">Sign Up</button>
    <button type="button" onClick={() => navigate("/")}>Login</button>
  </div>
</form>
      </div>
    </div>
  );
}

export default SignUp;
