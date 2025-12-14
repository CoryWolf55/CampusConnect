import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import '../styles/LoginSignup.css'; // reuse the same CSS

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const saveLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(
      `${API_BASE_URL}/users/register`,
      { Email: email, PasswordHash: password }
    );

    console.log("Server response:", response);

    if (response.status === 201) {
      const user = response.data;
      localStorage.setItem("userId", response.data.id); // ensure it’s the number
      localStorage.setItem("userEmail", user.email);
      navigate("/profilecreate"); // go to profile creation
    } else {
      alert("Unexpected response: " + JSON.stringify(response.data));
    }

  } catch (error) {
    console.error("Full error object:", error);

    if (error.response) {
      // Server responded with status code outside 2xx
      console.error("Server response data:", error.response.data);
      console.error("Server response status:", error.response.status);
      console.error("Server headers:", error.response.headers);
      alert("Sign-up failed: " + JSON.stringify(error.response.data));
    } else if (error.request) {
      // Request was made but no response received
      console.error("No response received, request object:", error.request);
      alert("Sign-up failed: No response from server (check server is running and CORS).");
    } else {
      // Something else caused the error
      console.error("Error setting up request:", error.message);
      alert("Sign-up failed: " + error.message);
    }
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
