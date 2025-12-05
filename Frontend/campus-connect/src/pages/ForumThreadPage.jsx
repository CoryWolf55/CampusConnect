import React from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../config";
import '../styles/Forums.css';

function ForumThreadPage() {
  const { threadId } = useParams();

  // Mock threads
  const threads = {
    1: {
      title: "Welcome to CampusConnect",
      author: "Admin",
      posts: [
        { id: 1, author: "Admin", content: "Welcome everyone!" },
        { id: 2, author: "Alice", content: "Excited to be here!" }
      ]
    },
    2: {
      title: "CS101 Discussion",
      author: "Alice",
      posts: [
        { id: 1, author: "Alice", content: "Who finished the homework?" },
        { id: 2, author: "Bob", content: "Almost done!" }
      ]
    },
    3: {
      title: "Club Announcements",
      author: "Bob",
      posts: [
        { id: 1, author: "Bob", content: "Chess club meeting on Friday." }
      ]
    }
  };

  const thread = threads[threadId];

  if (!thread) return <div>Thread not found</div>;

  return (
    <div className="forum-thread-page">
      <h1>{thread.title}</h1>
      <p><b>Author:</b> {thread.author}</p>
      <ul className="post-list">
        {thread.posts.map(post => (
          <li key={post.id} className="post-item">
            <b>{post.author}:</b> {post.content}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ForumThreadPage;
