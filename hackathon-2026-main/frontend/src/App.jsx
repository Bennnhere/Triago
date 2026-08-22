import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import TriagoIntro from "./components/common/TriagoIntro";

export default function App() {
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem("triago_intro_played");
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem("triago_intro_played", "true");
    setShowIntro(false);
  };

  return (
    <Router>
      {showIntro && <TriagoIntro onComplete={handleIntroComplete} />}
      
      <Routes>
        {/* Root redirects to signup */}
        <Route path="/" element={<Navigate to="/signup" replace />} />
        
        {/* Auth Pages */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        
        {/* Onboarding Flow */}
        <Route path="/onboarding" element={<Onboarding />} />
        
        {/* Dashboard Placeholder */}
        <Route
          path="/dashboard"
          element={
            <div style={{ padding: 60, color: "#fff", background: "#0a0714", minHeight: "100vh", fontFamily: "sans-serif" }}>
              <h1>TRIAGO Dashboard</h1>
              <p>Autonomous SRE workspace active. Incident monitoring initialized.</p>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}