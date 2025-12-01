import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const saveLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/api/users/register",
        {
          email: email,
          passwordHash: password
        }
      );

      if (response.data === true) {
        localStorage.setItem("userEmail", email);
        navigate("/profilecreate");
      } else {
        alert("Invalid credentials");
        //No Account found
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Check the console.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>SignUp</h2>
      <form onSubmit={saveLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default SignUp;