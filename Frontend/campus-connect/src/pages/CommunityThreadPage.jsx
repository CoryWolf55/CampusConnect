import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "../styles/Dashboard.css";

function CommunityThreadsPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const currentUserId = parseInt(localStorage.getItem("userId"));

  const [threads, setThreads] = useState([]);
  const [communityName, setCommunityName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [threadTitle, setThreadTitle] = useState("");

  const handleNavClick = (path) => navigate(path);
  const handleProfileClick = () => navigate("/profilepage");

  const handleThreadClick = (threadId) => {
    if (threadId) navigate(`/forums/thread/${threadId}`);
  };

  const handleCreateThread = async () => {
    if (!threadTitle.trim()) return;

    try {
      const payload = {
        CommunityId: parseInt(communityId),
        Title: threadTitle.trim(),
        CreatedById: currentUserId,
      };

      const res = await axios.post(`${API_BASE_URL}/forums/thread`, payload);
      const newThread = res.data;
      newThread.Username = "You"; // current user
      setThreads((prev) => [newThread, ...prev]);
      setThreadTitle("");
      setShowModal(false);
    } catch (err) {
      console.error("Failed to create thread:", err.response?.data || err);
    }
  };

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        // Fetch threads
        const threadsRes = await axios.get(
          `${API_BASE_URL}/forums/community/${communityId}/threads`
        );
        const threadsData = threadsRes.data || [];

        // Attach usernames
        const threadsWithUsernames = threadsData.map(t => ({
  ...t,
  Username:
    t.createdBy?.id === t.createdById &&
    t.createdBy?.id === Number(localStorage.getItem("profileId"))
      ? "You"
      : t.createdBy?.username ?? "Unknown"
}));

        setThreads(threadsWithUsernames);

        // Fetch community name
        const email = localStorage.getItem("userEmail");
        if (email) {
          const communitiesRes = await axios.post(
            `${API_BASE_URL}/forums/community/by-email`,
            JSON.stringify(email),
            { headers: { "Content-Type": "application/json" } }
          );
          const community = communitiesRes.data.find(
            (c) => c.id === parseInt(communityId)
          );
          setCommunityName(community?.name || "Community Threads");
        }
      } catch (err) {
        console.error("Failed to fetch threads:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    if (communityId) fetchThreads();
  }, [communityId, currentUserId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="dashboard-page">
      {/* Banner with profile button */}
     <header className="banner">
        <div className="logo">CampusConnect</div>
        <button className="profile-btn" onClick={handleProfileClick}>Profile</button>
      </header>

      {/* Navbar */}
      <nav className="navbar">
        <ul>
          <li onClick={() => handleNavClick("/dashboard")}>Dashboard</li>
          <li onClick={() => handleNavClick("/forums")}>Forums</li>
          <li onClick={() => handleNavClick("/notifications")}>Notifications</li>
          <li onClick={() => handleNavClick("/settings")}>Settings</li>
        </ul>
      </nav>

      {/* Threads list */}
      <div className="dashboard-container">
        <h1>{communityName}</h1>
        {loading ? (
          <p>Loading threads...</p>
        ) : threads.length === 0 ? (
          <p>No threads yet. Be the first to post!</p>
        ) : (
          <ul className="forum-list">
            {threads.map((t) => (
              <li
                key={t.id}
                className="forum-item"
                onClick={() => handleThreadClick(t.id)}
              >
                <h3>{t.title}</h3>
                <p>
                  Posted by <strong>{t.Username}</strong> • {formatDate(t.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Floating + button for creating thread */}
      <button
        className="add-community-btn"
        onClick={() => setShowModal(true)}
      >
        +
      </button>

      {/* Modal for creating thread */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create Thread</h2>
            <input
              type="text"
              value={threadTitle}
              onChange={(e) => setThreadTitle(e.target.value)}
              placeholder="Thread title"
            />
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={handleCreateThread}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunityThreadsPage;
