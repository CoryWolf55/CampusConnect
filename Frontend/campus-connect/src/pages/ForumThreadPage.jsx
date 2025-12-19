import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

function ForumThreadPage() {
  const { threadId } = useParams();
  const currentUserId = parseInt(localStorage.getItem("userId"));
  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThread = async () => {
      if (!threadId) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/forums/thread/${threadId}`);
        const t = res.data;

        // 1️⃣ Set thread username
        const threadUsername =
          t.createdById === currentUserId
            ? "You"
            : t.createdBy?.Username?.trim() || `User ${t.createdById}`;

        setThread({ ...t, Username: threadUsername });

        // 2️⃣ Set posts usernames
        const postsWithUsernames = (t.posts || []).map((p) => ({
          ...p,
          Username:
            p.createdById === currentUserId
              ? "You"
              : p.CreatedBy?.Username?.trim() || `User ${p.createdById}`
        }));

        setPosts(postsWithUsernames);
      } catch (err) {
        console.error("Failed to load thread:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchThread();
  }, [threadId, currentUserId]);

  const handleAddPost = async () => {
    if (!newPost.trim() || !thread) return;

    try {
      const res = await axios.post(`${API_BASE_URL}/forums/thread/${threadId}/posts`, {
        content: newPost.trim(),
        CreatedById: currentUserId
      });

      // Add post with "You" username
      setPosts((prev) => [...prev, { ...res.data, Username: "You" }]);
      setNewPost("");
    } catch (err) {
      console.error("Failed to add post:", err.response?.data || err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!thread) return <div>Thread not found</div>;

  return (
    <div>
      <h1>{thread.Title}</h1>
      <p>Posted by {thread.Username}</p>

      <ul>
        {posts.map((post, index) => (
          <li key={post.id ?? index}>
            <strong>{post.Username}</strong>: {post.Content}
          </li>
        ))}
      </ul>

      <textarea
        placeholder="Add a reply..."
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
      />
      <button onClick={handleAddPost}>Reply</button>
    </div>
  );
}

export default ForumThreadPage;
