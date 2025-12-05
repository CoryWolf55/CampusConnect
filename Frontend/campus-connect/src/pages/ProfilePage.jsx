import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "../styles/Profile.css";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    // Mock profile fallback
    const mockData = {
      Username: "Test User",
      Major: "Computer Science",
      Year: "Sophomore",
      Description: "This is a mock profile.",
      ProfileClubs: "Chess Club, Coding Club",
      ProfileCourses: "CS101, CS102",
    };

    if (!userId) {
      setProfile(mockData);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/profile/${userId}`, {
          credentials: "include",
        });
        const data = await res.json();
        setProfile(data || mockData);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setProfile(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleNavClick = (path) => navigate(path);

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Could not load profile</div>;

  return (
    <div className="profile-page-wrapper">

      {/* HEADER */}
      <header className="profile-header">
        <div className="logo">CampusConnect</div>

        <button
          className="profile-header-btn"
          onClick={() =>
            navigate("/profilecreate", { state: { profile: profile } })
          }
        >
          Edit Profile
        </button>
      </header>

      {/* DASHBOARD NAVBAR (same as dashboard) */}
      <nav className="navbar">
        <ul>
          <li onClick={() => handleNavClick("/dashboard")}>Dashboard</li>
          <li onClick={() => handleNavClick("/forums")}>Forums</li>
          <li onClick={() => handleNavClick("/notifications")}>Notifications</li>
          <li onClick={() => handleNavClick("/settings")}>Settings</li>
        </ul>
      </nav>

      {/* MAIN CONTENT */}
      <div className="profile-content">
        {/* Left column */}
        <div className="profile-left">
          <img
            className="profile-avatar"
            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
            alt="Profile"
          />

          <h2 className="profile-username">{profile.Username}</h2>
          <p className="profile-major">{profile.major}</p>
          <p className="profile-year">{profile.year}</p>
        </div>

        {/* Right column */}
        <div className="profile-right">
          <h3>About Me</h3>
          <p className="profile-description">{profile.Description}</p>

          <h3>Clubs</h3>
          <p>{profile.ProfileClubs}</p>

          <h3>Courses</h3>
          <p>{profile.ProfileCourses}</p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
