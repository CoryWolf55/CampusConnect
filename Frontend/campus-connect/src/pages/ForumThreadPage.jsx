import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "../styles/Dashboard.css";

function ForumThreadPage() {
  const { threadId } = useParams();
  const currentUserId = parseInt(localStorage.getItem("userId"));
  const navigate = useNavigate();

  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);

  // Normalize post data safely
  const normalizePost = (p) => ({
    Id: p.Id ?? p.id,
    Content: p.Content ?? p.content ?? "",
    CreatedAt: p.CreatedAt ?? p.createdAt ?? new Date().toISOString(),
    Username: p.CreatedBy?.username ?? `User ${p.CreatedById}`,
  });

  const normalizeThread = (t) => ({
    Id: t.Id ?? t.id,
    Title: t.Title ?? t.title ?? "",
    CreatedAt: t.CreatedAt ?? t.createdAt ?? new Date().toISOString(),
    Username: t.CreatedBy?.username ?? `User ${t.CreatedById}`,
    Posts: (t.Posts ?? t.posts ?? []).map(normalizePost),
  });

  useEffect(() => {
    document.body.classList.add("dashboard");
    return () => document.body.classList.remove("dashboard");
  }, []);

  useEffect(() => {
    const fetchThread = async () => {
      setLoading(true);
      setThread(null);
      setPosts([]);

      if (!threadId) return;

      try {
        const res = await axios.get(`${API_BASE_URL}/forums/thread/${threadId}`);
        const t = normalizeThread(res.data);
        setThread(t);
        setPosts(t.Posts || []);
      } catch (err) {
        console.error("Failed to load thread:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchThread();
  }, [threadId]);

  const handleAddPost = async () => {
    if (!newPost.trim() || !thread) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/forums/thread/${threadId}/posts`, {
        Content: newPost.trim(),
        CreatedById: currentUserId,
      });
      setPosts((prev) => [...prev, normalizePost(res.data)]);
      setNewPost("");
    } catch (err) {
      console.error("Failed to add post:", err.response?.data || err);
    }
  };

  const handleProfileClick = () => navigate("/profilepage");
  const handleNavClick = (path) => navigate(path);

  if (loading) return <div className="dashboard-container">Loading...</div>;
  if (!thread) return <div className="dashboard-container">Thread not found</div>;

  return (
    <div className="dashboard-page">
      {/* Banner */}
      <header className="banner">
        <div className="logo">CampusConnect</div>
        <button className="profile-btn" onClick={handleProfileClick}>
          Profile
        </button>
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

      {/* Main Content */}
      <div className="dashboard-container">
        <div className="thread-header">
          <h1>{thread.Title}</h1>
          <p className="thread-meta">
            Posted by <strong>{thread.Username}</strong>
          </p>
        </div>

        <ul className="posts-list">
          {posts.map((post) => (
            <li key={post.Id} className="post-card">
              <div className="post-meta">
                <strong>{post.Username}</strong> • {new Date(post.CreatedAt).toLocaleString()}
              </div>
              <div className="post-content">{post.Content}</div>
            </li>
          ))}
        </ul>

        <div className="reply-box">
          <textarea
            placeholder="Add a reply..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <button onClick={handleAddPost}>Reply</button>
        </div>
      </div>
    </div>
  );
}

export default ForumThreadPage;
