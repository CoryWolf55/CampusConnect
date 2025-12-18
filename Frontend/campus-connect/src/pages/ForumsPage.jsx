import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "../styles/Dashboard.css";

function ForumsPage() {
  const navigate = useNavigate();

  const [communities, setCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [communityName, setCommunityName] = useState("");

  const handleProfileClick = () => navigate("/profilepage");
  const handleNavClick = (path) => navigate(path);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;

    const fetchCommunities = async () => {
      try {
        const res = await axios.post(
          `${API_BASE_URL}/forums/community/by-email`,
          JSON.stringify(email),
          { headers: { "Content-Type": "application/json" } }
        );

        console.log("Fetched communities with threads: ", res.data);
        setCommunities(res.data);
      } catch (err) {
        console.error("Community fetch failed:", err.response?.data || err);
      } finally {
        setLoadingCommunities(false);
      }
    };

    fetchCommunities();
  }, []);

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

      setCommunities((prev) => [...prev, { ...res.data, ForumThreads: [] }]);
      setCommunityName("");
      setShowModal(false);
    } catch (err) {
      console.error("Create community failed:", err.response?.data || err);
      alert("Failed to create community");
    }
  };

  const handleThreadClick = (threadId) => {
    console.log("Navigating to thread", threadId);
    navigate(`/forums/thread/${threadId}`);
  };

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
              <li key={c.id} className="forum-item">
                <h3>{c.name}</h3>
                <ul className="thread-list">
                  {(c.ForumThreads || []).map((t) => (
                    <li
                      key={t.Id}
                      className="thread-item"
                      onClick={() => handleThreadClick(t.Id)}
                      style={{ cursor: "pointer" }}
                    >
                      {t.Title} — {t.CreatedBy?.FullName || "Unknown"}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}

        <button className="add-community-btn" onClick={() => setShowModal(true)}>
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
