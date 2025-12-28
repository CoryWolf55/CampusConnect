import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../config";
import axios from "axios";

function ProfileCreationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [clubs, setClubs] = useState("");
  const [courses, setCourses] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const data = location.state?.profile;
    if (data) {
      setProfile(data);
      setUsername(data.username || "");
      setMajor(data.major || "");
      setYear(data.year || "");
      setDescription(data.description || "");
      setClubs(data.profileClubs?.join(", ") || "");
      setCourses(data.profileCourses?.join(", ") || "");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      if (!userId) return setLoading(false);
      try {
        const res = await axios.get(`${API_BASE_URL}/users/profile/by-login/${userId}`);
        if (res.data) {
          setProfile(res.data);
          setUsername(res.data.username || "");
          setMajor(res.data.major || "");
          setYear(res.data.year || "");
          setDescription(res.data.description || "");
          setClubs(res.data.profileClubs?.join(", ") || "");
          setCourses(res.data.profileCourses?.join(", ") || "");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, location.state]);

  // Add clubs after profile is created
  const addClubs = async (profileId) => {
    if (!clubs.trim()) return;
    const clubNames = clubs
      .split(",")
      .map(c => c.trim())
      .filter(Boolean);
    await axios.post(`${API_BASE_URL}/users/profile/clubs`, { profileId, clubs: clubNames });
  };

  // Add courses after profile is created
  const addCourses = async (profileId) => {
    if (!courses.trim()) return;
    const courseNames = courses
      .split(",")
      .map(c => c.trim())
      .filter(Boolean);
    await axios.post(`${API_BASE_URL}/users/profile/courses`, { profileId, courses: courseNames });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!userId) return alert("No user logged in!");
    try {
      // Send profile first without clubs/courses
      const payload = {
        LoginId: Number(userId),
        Username: username.trim(),
        Major: major.trim(),
        Year: Number(year),
        Description: description.trim(),
      };
      const res = await axios.post(`${API_BASE_URL}/users/profile`, payload);
      const createdProfile = res.data;
      console.log("Profile created:", createdProfile);
      if (!createdProfile.id) {
        alert("Profile ID missing! Cannot add clubs/courses.");
        return;
      }
      // Add clubs and courses
      await addClubs(createdProfile.id);
      await addCourses(createdProfile.id);
      navigate("/profilepage");
    } catch (err) {
      console.error("Error saving profile:", err.response?.data || err);
      alert("Error saving profile. Check console.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="page">
      <div className="container">
        <div className="header">
          <h2 className ="text">{profile ? "Edit Profile" : "Create Profile"}</h2>
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
