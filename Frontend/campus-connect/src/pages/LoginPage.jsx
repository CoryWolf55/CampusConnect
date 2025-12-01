import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  //check if user Id has a profile username set, go to dashboard, otherwise create an account

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/api/users/validate",
        {
          email: email,
          passwordHash: password
        }
      );

      // Backend returns { id, email }
      if(response === null) return;
      const user = response.data;

      // Save login ID and email in localStorage
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userEmail", user.email);
      //check if 
      const profileCreated = await axios.get("http://localhost:5000/api/users/profile/${user.id}");
      if(profileCreated === false)
      {
        //No username therefore no profile
        navigate("/profilecreate");
      }
      else{
        //There is an account
        navigate("/dashboard");
      }
      
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Check the console.");
    }
  };

  const createAccount = async (e) => {
    e.preventDefault();
      //Go to account creation page
    navigate("/signup");
      
  };


  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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


      <form onSubmit={createAccount}>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default LoginPage;
