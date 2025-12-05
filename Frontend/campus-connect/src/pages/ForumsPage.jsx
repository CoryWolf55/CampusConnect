import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "../styles/Dashboard.css";

function ForumsPage() {
  const navigate = useNavigate();

  const [campusData, setCampusData] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);

  const handleProfileClick = () => navigate("/profilepage");
  const handleNavClick = (path) => navigate(path);

  // fallback mock communities
  const mockCommunities = [
    { id: 1, name: "General Discussion" },
    { id: 2, name: "Computer Science" },
    { id: 3, name: "Clubs & Events" },
  ];

  useEffect(() => {
    const email = localStorage.getItem("userEmail");

    const fetchCampus = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/campus`, {
          email: email,
        });
        setCampusData(response.data);
      } catch (err) {
      console.error("Error fetching campus:", err);

      // mock fallback campus
      setCampusData({
        id: "mock-campus",
        name: "Mock University",
        emailDomain: "mock.edu"
  });
}
    };

    const fetchCommunities = async () => {
      try {
        // TRY API
        const response = await axios.get(
          `${API_BASE_URL}/community?emailDomain=${email}`
        );

        if (response.data && response.data.length > 0) {
          setCommunities(response.data);
        } else {
          setCommunities(mockCommunities); // fallback if empty
        }
      } catch (err) {
        console.error("Error loading communities, using mock:", err);
        setCommunities(mockCommunities); // fallback on error
      } finally {
        setLoadingCommunities(false);
      }
    };

    fetchCampus();
    fetchCommunities();
  }, []);

  return (
    <div className="dashboard-page">
      {/* Banner */}
      <header className="banner">
        <div className="logo">CampusConnect</div>
        <button className="profile-btn" onClick={handleProfileClick}>
          Profile
        </button>
      </header>

      {/* Navigation */}
      <nav className="navbar">
        <ul>
          <li onClick={() => handleNavClick("/dashboard")}>Dashboard</li>
          <li onClick={() => handleNavClick("/forums")}>Forums</li>
          <li onClick={() => handleNavClick("/notifications")}>Notifications</li>
          <li onClick={() => handleNavClick("/settings")}>Settings</li>
        </ul>
      </nav>

      {/* Content */}
      <div className="dashboard-container">
        <h1>Forums</h1>

        {campusData && (
          <div>
            <h2>Campus: {campusData.name}</h2>
            <h3>Communities</h3>

            {/* Loading state */}
            {loadingCommunities ? (
              <p>Loading communities...</p>
            ) : (
              <ul className="forum-list">
                {communities.map((c) => (
                  <li key={c.id} className="forum-item">
                    <h3>{c.name}</h3>
                    <p>Community ID: {c.id}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Add Community button */}
        <button
          className="add-community-btn"
          onClick={() => alert("Open create community modal")}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default ForumsPage;
