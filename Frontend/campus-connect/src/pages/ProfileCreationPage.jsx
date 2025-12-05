import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import axios from "axios";

function ProfileCreationPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [username, setUsername] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [clubs, setClubs] = useState("");
  const [courses, setCourses] = useState("");

  const userId = localStorage.getItem("userId");

  // Fetch existing profile if it exists, or use mock data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        // MOCK DATA for testing
        const mockData = {
          Username: "Test User",
          Major: "Computer Science",
          Year: "Sophomore",
          Description: "This is a mock profile.",
          ProfileClubs: "Chess Club, Coding Club",
          ProfileCourses: "CS101, CS102",
        };
        setProfile(mockData);
        setUsername(mockData.Username);
        setMajor(mockData.Major);
        setYear(mockData.Year);
        setDescription(mockData.Description);
        setClubs(mockData.ProfileClubs);
        setCourses(mockData.ProfileCourses);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/users/profile/${userId}`);
        if (res.data) {
          setProfile(res.data);
          setUsername(res.data.Username || "");
          setMajor(res.data.Major || "");
          setYear(res.data.Year || "");
          setDescription(res.data.Description || "");
          setClubs(res.data.ProfileClubs || "");
          setCourses(res.data.ProfileCourses || "");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = { username, major, year, description, clubs, courses };
      
      if (!userId) {
        // For testing without API
        console.log("Mock save:", payload);
        alert("Profile saved (mock)!");
        setProfile(payload); // update the state as if saved
        return;
      }

      const res = await axios.post("http://localhost:5000/api/users/profile", payload);
      if (res.status >= 200 && res.status < 300) {
        alert("Profile saved successfully!");
        navigate("/profile");
      } else {
        alert("Failed to save profile. Try again.");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Error saving profile.");
    }
  };

  if (loading) return <div>Loading...</div>;

  const isEditMode = profile !== null;

  return (
    <div className="page">
      <div className="container">
        <div className="header">
          <h2>{isEditMode ? "Edit Profile" : "Create Profile"}</h2>
          <div className="underline"></div>
        </div>

        <form onSubmit={saveProfile}>
          <div className="input">
            <label>Username:</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          <div className="input">
            <label>Description:</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="input">
            <label>Year:</label>
            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
          </div>

          <div className="input">
            <label>Major:</label>
            <input type="text" value={major} onChange={(e) => setMajor(e.target.value)} />
          </div>

          <div className="input">
            <label>Clubs:</label>
            <input type="text" value={clubs} onChange={(e) => setClubs(e.target.value)} />
          </div>

          <div className="input">
            <label>Courses:</label>
            <input type="text" value={courses} onChange={(e) => setCourses(e.target.value)} />
          </div>

          <div className="button-container">
            <button type="submit">{isEditMode ? "Update Profile" : "Create Profile"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileCreationPage;
