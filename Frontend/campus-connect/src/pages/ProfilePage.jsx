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
    const fetchProfile = async () => {
      if (!userId) {
        // fallback mock
        setProfile({
          Username: "Test User",
          Major: "Computer Science",
          Year: "Sophomore",
          Description: "This is a mock profile.",
          ProfileClubs: "Chess Club, Coding Club",
          ProfileCourses: "CS101, CS102",
        });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/users/profile/${userId}`);
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
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
      <header className="profile-header">
        <div className="logo">CampusConnect</div>
        <button
          className="profile-header-btn"
          onClick={() =>
            navigate("/profilecreate", { state: { profile } })
          }
        >
          Edit Profile
        </button>
      </header>

      <nav className="navbar">
        <ul>
          <li onClick={() => handleNavClick("/dashboard")}>Dashboard</li>
          <li onClick={() => handleNavClick("/forums")}>Forums</li>
          <li onClick={() => handleNavClick("/notifications")}>Notifications</li>
          <li onClick={() => handleNavClick("/settings")}>Settings</li>
        </ul>
      </nav>

      <div className="profile-content">
        <div className="profile-left">
          <img
            className="profile-avatar"
            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
            alt="Profile"
          />
          <h2 className="profile-username">{profile.Username}</h2>
          <p className="profile-major">{profile.Major}</p>
          <p className="profile-year">{profile.Year}</p>
        </div>

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
