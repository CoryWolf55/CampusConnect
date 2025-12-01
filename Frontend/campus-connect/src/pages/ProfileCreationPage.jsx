import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
        {   
            username: username,
            major: major,
            year: year,
            description: description,
            clubs: clubs,
            courses: courses
        }
      );

    } catch (error) {
      console.error("Error:", error);
      alert("Error.");
    }
  };

  

  //To do - Add drop downs for major, courses, clubs
  return (
  <div style={{ maxWidth: "400px", margin: "50px auto" }}>
    <h2>Profile Creation</h2>
    <form onSubmit={saveProfile}>

      <div>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Description:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Year:</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        />
      </div>
    
      <div>
        <label>Major:</label>
        <input
          type="text"
          value={major}
          onChange={(e) => setMajor(e.target.value)}
        />
      </div>
      
      <button type="submit">Save</button>
    </form>
  </div>
);

}

export default ProfileCreationPage;
