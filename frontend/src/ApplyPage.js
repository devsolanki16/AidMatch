import React, { useEffect, useState } from "react";
import GeneralProfileForm from "./GeneralProfileForm";

export default function ApplyPage() {
  const [formData, setFormData] = useState(null);
  const [scheme, setScheme] = useState(null);

  useEffect(() => {
    const filename = localStorage.getItem("profileFilename");
    const schemeData = localStorage.getItem("selectedScheme");
    setScheme(schemeData ? JSON.parse(schemeData) : null);

    if (filename) {
      // Fetch the auto-filled form from the agent endpoint
      fetch(`http://localhost:8000/get-filled-form?filename=${filename}`)
        .then(res => res.json())
        .then(data => setFormData(data));
    }
  }, []);

  if (!formData || !scheme) {
    return <div>Loading profile and scheme...</div>;
  }

  const handleApply = async (filledForm) => {
    const res = await fetch("http://localhost:8000/generate-application-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: filledForm, scheme }),
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      // Option 1: Auto-download
      const a = document.createElement("a");
      a.href = url;
      a.download = "application.pdf";
      a.click();
      // Option 2: Show a download link (set state and render <a>)
      // setPdfUrl(url);
    } else {
      alert("Failed to generate PDF.");
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
      <h2>Apply for: {scheme.name}</h2>
      <GeneralProfileForm onSubmit={handleApply} initialValues={formData} />
    </div>
  );
}
