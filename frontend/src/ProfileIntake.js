import React, { useState } from "react";
import "./ProfileIntake.css";
import VoiceProfileIntake from "./VoiceProfileIntake";
import { useNavigate } from "react-router-dom";

export default function ProfileIntake() {
  const [showVoice, setShowVoice] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [matchingSchemes, setMatchingSchemes] = useState([]);
  const [profileFilename, setProfileFilename] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:8000/save-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValues),
    })
      .then(res => res.json())
      .then(data => {
        alert("Form submitted and saved on server as: " + data.filename);
        setProfileFilename(data.filename); // Save filename in state
        localStorage.setItem("profileFilename", data.filename); // Store in localStorage
        // Now call the AI matching endpoint
        fetch("http://localhost:8000/ai-match-schemes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formValues),
        })
          .then(res => res.json())
          .then(data => {
            setMatchingSchemes(data.matches || []);
            console.log("AI matches:", data.matches);
          });
      })
      .catch(err => {
        alert("Submission failed!");
        console.error(err);
      });
  };

  const handleApply = (scheme) => {
    // Store the profile filename and selected scheme in localStorage
    localStorage.setItem("profileFilename", profileFilename);
    localStorage.setItem("selectedScheme", JSON.stringify(scheme));
    navigate("/apply");
  };


  return (
    <div className="profile-root">
      <header className="landing-header">
        <span className="logo">🪙</span>
        <span className="app-name">AidMatch</span>
      </header>
      <div className="profile-main-content">
        <h1>Tell Us About Yourself</h1>
        <p>Provide your details to find matching schemes. You can either fill the form or use your voice.</p>
        <div className="voice-section">
          <button
            className="voice-btn dark-btn"
            onClick={() => setShowVoice((v) => !v)}
            type="button"
          >
            🎤 Fill form with my voice
          </button>
        </div>
        {showVoice && (
          <div className="voice-intake-wrapper">
            <VoiceProfileIntake
              onComplete={(voiceData) => {
                console.log("ProfileIntake received voiceData:", voiceData);
                setFormValues(voiceData);
                setTimeout(() => {
                  console.log("formValues after set:", formValues);
                }, 1000);
                setShowVoice(false);
              }}
            />
          </div>
        )}
        <div className="divider-or-wrapper">
          <hr className="divider-line" />
          <span className="or-divider-on-line">OR FILL MANUALLY</span>
          <hr className="divider-line" />
        </div>
        <form className="profile-form" onSubmit={handleSubmit}>
          {/* 1. Personal Information */}
          <section>
            <h2>1. Personal Information</h2>
            <label>Full Name
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={formValues.fullName || ""}
                onChange={e => setFormValues(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </label>
            <label>Date of Birth / Age
              <input
                type="date"
                value={formValues.dob || ""}
                onChange={e => setFormValues(prev => ({ ...prev, dob: e.target.value }))}
              />
            </label>
            <label>Gender
              <select
                value={formValues.gender || ""}
                onChange={e => setFormValues(prev => ({ ...prev, gender: e.target.value }))}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label>Mobile Number
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={formValues.mobileNumber || ""}
                onChange={e => setFormValues(prev => ({ ...prev, mobileNumber: e.target.value }))}
              />
            </label>
            <label>Email Address
              <input
                type="email"
                placeholder="e.g. user@example.com"
                value={formValues.email || ""}
                onChange={e => setFormValues(prev => ({ ...prev, email: e.target.value }))}
              />
            </label>
          </section>
          {/* 2. Address & Residency Details */}
          <section>
            <h2>2. Address & Residency Details</h2>
            <label>Present Address
              <input
                type="text"
                placeholder="State, District, City/Village, Pin Code"
                value={formValues.presentAddress || ""}
                onChange={e => setFormValues(prev => ({ ...prev, presentAddress: e.target.value }))}
              />
            </label>
            <label>Permanent Address
              <input
                type="text"
                placeholder="State, District, City/Village, Pin Code"
                value={formValues.permanentAddress || ""}
                onChange={e => setFormValues(prev => ({ ...prev, permanentAddress: e.target.value }))}
              />
            </label>
            <label>Residency Proof
              <input
                type="text"
                placeholder="Aadhaar, ration card, voter ID, utility bills"
                value={formValues.residencyProof || ""}
                onChange={e => setFormValues(prev => ({ ...prev, residencyProof: e.target.value }))}
              />
            </label>
            <label>Duration of Residence (years)
              <input
                type="number"
                min="0"
                placeholder="e.g. 5"
                value={formValues.residenceDuration || ""}
                onChange={e => setFormValues(prev => ({ ...prev, residenceDuration: e.target.value }))}
              />
            </label>
          </section>
          {/* 3. Demographic / Social Category */}
          <section>
            <h2>3. Demographic / Social Category</h2>
            <label>Caste Status
              <select
                value={formValues.casteStatus || ""}
                onChange={e => setFormValues(prev => ({ ...prev, casteStatus: e.target.value }))}
              >
                <option value="">Select caste</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </label>
            <label>Disability Status
              <select
                value={formValues.disabilityStatus || ""}
                onChange={e => setFormValues(prev => ({ ...prev, disabilityStatus: e.target.value }))}
              >
                <option value="">Select</option>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </label>
            <label>Nativity Information
              <input
                type="text"
                placeholder="e.g. State of origin"
                value={formValues.nativity || ""}
                onChange={e => setFormValues(prev => ({ ...prev, nativity: e.target.value }))}
              />
            </label>
          </section>
          {/* 4. Economic & Occupational Details */}
          <section>
            <h2>4. Economic & Occupational Details</h2>
            <label>Annual Income / Income Bracket
              <input
                type="text"
                placeholder="e.g. 2,00,000 or BPL/APL"
                value={formValues.annualIncome || ""}
                onChange={e => setFormValues(prev => ({ ...prev, annualIncome: e.target.value }))}
              />
            </label>
            <label>Occupation
              <input
                type="text"
                placeholder="e.g. Farmer, Self-employed"
                value={formValues.occupation || ""}
                onChange={e => setFormValues(prev => ({ ...prev, occupation: e.target.value }))}
              />
            </label>
            <label>Landholding Proof
              <input
                type="text"
                placeholder="Patta, deed, etc."
                value={formValues.landholdingProof || ""}
                onChange={e => setFormValues(prev => ({ ...prev, landholdingProof: e.target.value }))}
              />
            </label>
          </section>
          {/* 5. Banking Information */}
          <section>
            <h2>5. Banking Information</h2>
            <label>Bank Account Number
              <input
                type="text"
                placeholder="Account number"
                value={formValues.bankAccountNumber || ""}
                onChange={e => setFormValues(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
              />
            </label>
            <label>IFSC Code
              <input
                type="text"
                placeholder="IFSC code"
                value={formValues.ifscCode || ""}
                onChange={e => setFormValues(prev => ({ ...prev, ifscCode: e.target.value }))}
              />
            </label>
            <label>Cancelled Cheque / Passbook
              <input
                type="text"
                placeholder="Upload or enter details"
                value={formValues.cancelledCheque || ""}
                onChange={e => setFormValues(prev => ({ ...prev, cancelledCheque: e.target.value }))}
              />
            </label>
          </section>
          {/* 6. Identity & Certificate Documents */}
          <section>
            <h2>6. Identity & Certificate Documents</h2>
            <label>ID Proof
              <input
                type="text"
                placeholder="Aadhaar, voter ID, etc."
                value={formValues.idProof || ""}
                onChange={e => setFormValues(prev => ({ ...prev, idProof: e.target.value }))}
              />
            </label>
            <label>Birth/Age Proof
              <input
                type="text"
                placeholder="Birth certificate, school certificate, etc."
                value={formValues.birthProof || ""}
                onChange={e => setFormValues(prev => ({ ...prev, birthProof: e.target.value }))}
              />
            </label>
            <label>Social Certificates
              <input
                type="text"
                placeholder="Caste, income, disability certificate, etc."
                value={formValues.socialCertificates || ""}
                onChange={e => setFormValues(prev => ({ ...prev, socialCertificates: e.target.value }))}
              />
            </label>
            <label>Special Scheme Docs
              <input
                type="text"
                placeholder="Widow, marriage certificate, etc."
                value={formValues.specialSchemeDocs || ""}
                onChange={e => setFormValues(prev => ({ ...prev, specialSchemeDocs: e.target.value }))}
              />
            </label>
          </section>
          {/* 7. Scheme-Specific or Asset-Related Details */}
          <section>
            <h2>7. Scheme-Specific or Asset-Related Details</h2>
            <label>Land Records
              <input
                type="text"
                placeholder="RoR, patta, etc."
                value={formValues.landRecords || ""}
                onChange={e => setFormValues(prev => ({ ...prev, landRecords: e.target.value }))}
              />
            </label>
            <label>Employment Registration
              <input
                type="text"
                placeholder="ESI card, contractor certificate, etc."
                value={formValues.employmentRegistration || ""}
                onChange={e => setFormValues(prev => ({ ...prev, employmentRegistration: e.target.value }))}
              />
            </label>
            <label>Academic Details
              <input
                type="text"
                placeholder="Course, institution, enrollment, etc."
                value={formValues.academicDetails || ""}
                onChange={e => setFormValues(prev => ({ ...prev, academicDetails: e.target.value }))}
              />
            </label>
          </section>
          {/* 8. Photograph / Biometric */}
          <section>
            <h2>8. Photograph / Biometric</h2>
            <label>Recent Passport-size Photograph
              <input
                type="file"
                accept="image/*"
                // File input is not auto-filled
              />
            </label>
            <label>Mobile Number Linked to Aadhaar
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={formValues.aadhaarLinkedMobile || ""}
                onChange={e => setFormValues(prev => ({ ...prev, aadhaarLinkedMobile: e.target.value }))}
              />
            </label>
          </section>
          <button type="submit" className="submit-btn dark-btn">Submit</button>
        </form>
        {/* AI Recommendations Section */}
        {Array.isArray(matchingSchemes) && matchingSchemes.length > 0 && (
          <section style={{ marginTop: 40, background: '#f6f7e7', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#2d6a4f' }}>Recommended Government Schemes</h2>
            <ul style={{ marginTop: 16 }}>
              {matchingSchemes.map((scheme, idx) => (
                <li key={scheme.name || idx} style={{ marginBottom: 12 }}>
                  <b>{scheme.name}</b><br />
                  <span style={{ color: '#457b9d' }}>{scheme.reason}</span>
                  <br />
                  <button onClick={() => handleApply(scheme)}>Apply</button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
