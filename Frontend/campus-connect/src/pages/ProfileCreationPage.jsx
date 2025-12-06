import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../config";
import axios from "axios";

function ProfileCreationPage() {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Populate form if editing
  useEffect(() => {
    const data = location.state?.profile;
    if (data) {
      setProfile(data);
      setUsername(data.Username || "");
      setMajor(data.Major || "");
      setYear(data.Year || "");
      setDescription(data.Description || "");
      setClubs(data.ProfileClubs || "");
      setCourses(data.ProfileCourses || "");
      setLoading(false);
      return;
    }

    // Fetch profile from API if no state passed
    const fetchProfile = async () => {
      if (!userId) {
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
  }, [userId, location.state]);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("No user logged in!");
      return;
    }

    try {
      const payload = {
        username,
        major,
        year: Number(year),
        description,
        clubs,
        courses,
        loginId: Number(userId)
      };

      await axios.post(`${API_BASE_URL}/users/profile`, payload);
      navigate("/profilepage");
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Error saving profile.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page">
      <div className="container">
        <div className="header">
          <h2>{profile ? "Edit Profile" : "Create Profile"}</h2>
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
            <button type="submit">{profile ? "Update Profile" : "Create Profile"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileCreationPage;
