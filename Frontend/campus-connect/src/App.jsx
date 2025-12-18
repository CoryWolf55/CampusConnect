import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage.jsx";
import SignUp from "./pages/SignUp.jsx";
import ProfileCreationPage from "./pages/ProfileCreationPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ForumsPage from "./pages/ForumsPage.jsx";
import ForumThreadPage from "./pages/ForumThreadPage.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profilecreate" element={<ProfileCreationPage />} />
        <Route path="/profilepage" element={<ProfilePage/>} />
        <Route path="/forums" element={<ForumsPage/>} />
        <Route path="/forums/thread/:threadId" element={<ForumThreadPage />} />
      </Routes>
    </Router>
  );
}

export default App;