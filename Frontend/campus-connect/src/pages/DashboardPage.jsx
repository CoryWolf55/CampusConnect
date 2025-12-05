import React from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import '../styles/Dashboard.css';

function DashboardPage() {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profilepage");
  };

  return (
    <div className="dashboard-page">
      {/* Top Banner */}
      <header className="banner">
        <div className="logo">CampusConnect</div>
        <button className="profile-btn" onClick={handleProfileClick}>
          Profile
        </button>
      </header>

      {/* Navigation Bar */}
      <nav className="navbar">
      <ul>
        <li onClick={() => navigate("/forums")}>Forums</li>
        <li onClick={() => navigate("/notifications")}>Notifications</li>
        <li onClick={() => navigate("/settings")}>Settings</li>
      </ul>
      </nav>

      {/* Dashboard Content */}
      <div className="dashboard-container">
        <h1>Welcome to your Dashboard</h1>
        <p>Here you can access your profile, courses, clubs, and more.</p>
      </div>
    </div>
  );
}

export default DashboardPage;