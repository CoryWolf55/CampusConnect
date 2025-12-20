// ForumsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "../styles/Dashboard.css";

function ForumsPage() {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [communityName, setCommunityName] = useState("");

  const handleProfileClick = () => navigate("/profilepage");
  const handleNavClick = (path) => navigate(path);
  const handleCommunityClick = (communityId) => {
    navigate(`/forums/community/${communityId}`);
  };

  const handleCreateCommunity = async () => {
    if (!communityName.trim()) return;

    const email = localStorage.getItem("userEmail");
    if (!email) return;

    const emailDomain = email.split("@")[1];

    try {
      const res = await axios.post(`${API_BASE_URL}/forums/community`, {
        name: communityName.trim(),
        emailDomain,
      });

      setCommunities((prev) => [...prev, res.data]);
      setCommunityName("");
      setShowModal(false);
    } catch (err) {
      console.error("Create community failed:", err.response?.data || err);
      alert("Failed to create community");
    }
  };

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        if (!email) return;

        const res = await axios.post(
          `${API_BASE_URL}/forums/community/by-email`,
          JSON.stringify(email),
          { headers: { "Content-Type": "application/json" } }
        );

        setCommunities(res.data || []);
      } catch (err) {
        console.error("Community fetch failed:", err.response?.data || err);
      } finally {
        setLoadingCommunities(false);
      }
    };

    fetchCommunities();
  }, []);

  return (
    <div className="dashboard-page">
      <header className="banner">
        <div className="logo">CampusConnect</div>
        <button className="profile-btn" onClick={handleProfileClick}>
          Profile
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

      <div className="dashboard-container">
        <h1>Forums</h1>

        {loadingCommunities ? (
          <p>Loading...</p>
        ) : communities.length === 0 ? (
          <p>No communities found.</p>
        ) : (
          <ul className="forum-list">
            {communities.map((c) => (
              <li
                key={c.id}
                className="forum-item"
                onClick={() => handleCommunityClick(c.id)}
                style={{ cursor: "pointer" }}
              >
                <h3>{c.name}</h3>
              </li>
            ))}
          </ul>
        )}

        <button
          className="add-community-btn"
          onClick={() => setShowModal(true)}
        >
          +
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create Community</h2>
            <input
              type="text"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              placeholder="Community name"
            />
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={handleCreateCommunity}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ForumsPage;
