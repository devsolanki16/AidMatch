import React from "react";
import "./LandingPage.css";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate("/profile");
  };
  return (
    <div className="landing-root">
      <header className="landing-header">
        <span className="logo">🪙</span>
        <span className="app-name">AidMatch</span>
      </header>
      <main className="landing-main">
        <h1 className="landing-title">AidMatch: Scheme Finder</h1>
        <p className="landing-subtitle">
          Connecting you to the government schemes you deserve. Simply tell us about yourself, and let our AI find the perfect support for you.
        </p>
        <button className="get-started-btn" onClick={handleGetStarted}>
          Get Started &rarr;
        </button>
        <section className="how-it-works">
          <div className="how-card">
            <h2>How It Works</h2>
            <p>A simple 3-step process to find your match.</p>
            <ol>
              <li>
                <strong>Create Your Profile</strong>
                <br />
                Fill a simple form or just speak your details. It’s fast and easy.
              </li>
              <li>
                <strong>AI-Powered Matching</strong>
                <br />
                Our smart engine analyzes your profile to find the best schemes for you.
              </li>
              <li>
                <strong>Apply with Ease</strong>
                <br />
                Get help with applications and have your forms pre-filled instantly.
              </li>
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
} 