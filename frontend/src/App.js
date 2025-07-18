import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import ProfileIntake from "./ProfileIntake";
import VoiceProfileIntake from "./VoiceProfileIntake";
import ApplyPage from "./ApplyPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/profile" element={<ProfileIntake />} />
        <Route path="/voice-profile" element={<VoiceProfileIntake />} />
        <Route path="/apply" element={<ApplyPage />} />
      </Routes>
    </Router>
  );
}

export default App;
