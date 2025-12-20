import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "../styles/Dashboard.css";

function ForumThreadPage() {
  const { threadId } = useParams();
  const currentUserId = parseInt(localStorage.getItem("userId"));
  const currentUsername = localStorage.getItem("userName") || "You";

  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);

  // Normalize post data safely
  const normalizePost = (p) => ({
  Id: p.Id ?? p.id,
  Content: p.Content ?? p.content ?? "",
  CreatedAt: p.CreatedAt ?? p.createdAt ?? new Date().toISOString(),
  Username: p.CreatedBy?.Username || (p.CreatedById === currentUserId ? currentUsername : `User ${p.CreatedById}`),
});

  // Normalize thread data safely
  const normalizeThread = (t) => ({
    Id: t.Id ?? t.id,
    Title: t.Title ?? t.title ?? "",
    CreatedAt: t.CreatedAt ?? t.createdAt ?? new Date().toISOString(),
    Username:
      t.CreatedBy?.Username ||
      (t.CreatedById && t.CreatedById === currentUserId
        ? currentUsername
        : t.CreatedById
        ? `User ${t.CreatedById}`
        : "Unknown User"),
    Posts: (t.Posts ?? t.posts ?? []).map(normalizePost),
  });

  // Fetch thread
  useEffect(() => {
    const fetchThread = async () => {
      if (!threadId) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/forums/thread/${threadId}`);
        const t = normalizeThread(res.data);
        setThread(t);
        setPosts(t.Posts);
      } catch (err) {
        console.error("Failed to load thread:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchThread();
  }, [threadId, currentUserId, currentUsername]);

  // Add new post
  const handleAddPost = async () => {
    if (!newPost.trim() || !thread) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/forums/thread/${threadId}/posts`, {
        Content: newPost.trim(),
        CreatedById: currentUserId,
      });

      // Add post from backend and normalize
      setPosts((prev) => [...prev, normalizePost(res.data)]);
      setNewPost("");
    } catch (err) {
      console.error("Failed to add post:", err.response?.data || err);
    }
  };

  if (loading) return <div className="dashboard-container">Loading...</div>;
  if (!thread) return <div className="dashboard-container">Thread not found</div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Thread header */}
        <div className="thread-header">
          <h1>{thread.Title}</h1>
          <p className="thread-meta">
            Posted by <strong>{thread.Username}</strong>
          </p>
        </div>

        {/* Posts */}
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

        {/* Reply box */}
        <div
          className="reply-box"
          
        >
          <textarea
            placeholder="Add a reply..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <button
            onClick={handleAddPost}
          >
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForumThreadPage;
