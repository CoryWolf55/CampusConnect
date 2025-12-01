import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage.jsx";
import SignUp from "./pages/SignUp.jsx";
import ProfileCreationPage from "./pages/ProfileCreationPage.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profilecreate" element={<ProfileCreationPage />} />
      </Routes>
    </Router>
  );
}

export default App;