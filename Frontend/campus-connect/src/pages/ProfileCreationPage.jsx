import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../styles/LoginSignup.css'; // new CSS file

function ProfileCreationPage() {
  const [username, setUsername] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [clubs, setClubs] = useState("");
  const [courses, setCourses] = useState("");
  const navigate = useNavigate();

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/users/profile",
        { username, major, year, description, clubs, courses }
      );

      if (response.status >= 200 && response.status < 300) {
        alert("Profile updated successfully!");
        console.log("Updated profile:", response.data);
        navigate("/dashboard"); // redirect after saving
      } else {
        alert("Failed to update profile. Try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error updating profile.");
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="header">
          <div className="text">Create Profile</div>
          <div className="underline"></div>
        </div>

        <form onSubmit={saveProfile}>
          <div className="input">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input">
            <label>Description:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="input">
            <label>Year:</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
          </div>

          <div className="input">
            <label>Major:</label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
            />
          </div>

          <div className="input">
            <label>Clubs:</label>
            <input
              type="text"
              value={clubs}
              onChange={(e) => setClubs(e.target.value)}
            />
          </div>

          <div className="input">
            <label>Courses:</label>
            <input
              type="text"
              value={courses}
              onChange={(e) => setCourses(e.target.value)}
            />
          </div>

          <div className="button-container">
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileCreationPage;
