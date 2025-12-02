import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Dashboard.css"; // reuse dashboard styles

function ForumsPage() {
  const navigate = useNavigate();

  const [campusData, setCampusData] = useState(null); // state for campus info

  const handleProfileClick = () => {
    navigate("/profilepage");
  };

  const handleNavClick = (path) => {
    navigate(path);
  };

  // Sample forum threads
  const forums = [
    { id: 1, title: "Welcome to CampusConnect", author: "Admin" },
    { id: 2, title: "CS101 Study Group", author: "Alice" },
    { id: 3, title: "Chess Club Events", author: "Bob" },
  ];

  useEffect(() => {
    const fetchCampus = async () => {
      const email = localStorage.getItem("userEmail");
      try {
        const response = await axios.post("http://localhost:5000/api/campus", {
          email: email
        });
        console.log("Campus data:", response.data);
        setCampusData(response.data); // store campus data in state
      } catch (err) {
        console.error("Error fetching campus:", err);
      }
    };

    fetchCampus();
  }, []);

  //To-Do add community get/post

  //Navbar for communites and creating and joining, Forums page has the communities to select from. When selected you go to their thread 


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
          <li onClick={() => handleNavClick("/dashboard")}>Dashboard</li>
          <li onClick={() => handleNavClick("/forums")}>Forums</li>
          <li onClick={() => handleNavClick("/notifications")}>Notifications</li>
          <li onClick={() => handleNavClick("/settings")}>Settings</li>
        </ul>
      </nav>

      {/* Forums Content */}
      <div className="dashboard-container">
        <h1>Forums</h1>

        {campusData && (
          <div>
            <h2>Campus: {campusData.name}</h2>
            <h3>Communities:</h3>
            <ul>
              {communities.map((community, index) => (
                <li key={index}>{community}</li>
              ))}
            </ul>
          </div>
        )}

        {forums.length === 0 ? (
          <p>No forum threads yet.</p>
        ) : (
          <ul className="forum-list">
            {forums.map((forum) => (
              <li key={forum.id} className="forum-item">
                <h3>{forum.title}</h3>
                <p>Author: {forum.author}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ForumsPage;
