import React from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Dashboard.css';

function DashboardPage() {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile");
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
          <li>Forums</li>
          <li>Notifications</li>
          <li>Settings</li>
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