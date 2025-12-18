import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "../styles/Forums.css";

function ForumThreadPage() {
  const { threadId } = useParams();
  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThread = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/forums/thread/${threadId}`);
        setThread(res.data);
        setPosts(res.data.posts || []);
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
        content: newPost.trim(),
        createdById: 1 // TODO: replace with logged-in user's ID
      });

      setPosts(prev => [...prev, res.data]);
      setNewPost("");
    } catch (err) {
      console.error("Failed to add post:", err.response?.data || err);
      alert("Failed to add post");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!thread) return <div>Thread not found</div>;

  return (
    <div className="dashboard-page">
      <div className="forum-thread-container">
        <h1>{thread.title}</h1>
        <p>Posted by {thread.createdBy?.fullName || "Unknown"}</p>

        <ul className="post-list">
          {posts.map(post => (
            <li key={post.id} className="post-item">
              <div className="post-author">{post.createdBy?.fullName || "Unknown"}</div>
              <div className="post-content">{post.content}</div>
            </li>
          ))}
        </ul>

        <div className="reply-box">
          <textarea
            placeholder="Add a reply..."
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
          />
          <button onClick={handleAddPost}>Reply</button>
        </div>
      </div>
    </div>
  );
}

export default ForumThreadPage;
