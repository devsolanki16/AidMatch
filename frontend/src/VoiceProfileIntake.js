import React, { useRef, useState } from "react";

const fields = [
  // 1. Personal Information
  { name: "fullName", label: "What is your full name?" },
  { name: "dob", label: "What is your date of birth or age?" },
  { name: "gender", label: "What is your gender?" },
  { name: "mobileNumber", label: "What is your mobile number?" },
  { name: "email", label: "What is your email address?" },
  // 2. Address & Residency Details
  { name: "presentAddress", label: "What is your present address?" },
  { name: "permanentAddress", label: "What is your permanent address?" },
  { name: "residencyProof", label: "What residency proof do you have?" },
  { name: "residenceDuration", label: "How many years have you lived at your current address?" },
  // 3. Demographic / Social Category
  { name: "casteStatus", label: "What is your caste status?" },
  { name: "disabilityStatus", label: "Do you have any disability?" },
  { name: "nativity", label: "What is your nativity information?" },
  // 4. Economic & Occupational Details
  { name: "annualIncome", label: "What is your annual income or income bracket?" },
  { name: "occupation", label: "What is your occupation?" },
  { name: "landholdingProof", label: "Do you have any landholding proof?" },
  // 5. Banking Information
  { name: "bankAccountNumber", label: "What is your bank account number?" },
  { name: "ifscCode", label: "What is your bank's IFSC code?" },
  { name: "cancelledCheque", label: "Do you have a cancelled cheque or passbook?" },
  // 6. Identity & Certificate Documents
  { name: "idProof", label: "What ID proof do you have?" },
  { name: "birthProof", label: "What is your birth or age proof?" },
  { name: "socialCertificates", label: "Do you have any social certificates?" },
  { name: "specialSchemeDocs", label: "Do you have any special scheme documents?" },
  // 7. Scheme-Specific or Asset-Related Details
  { name: "landRecords", label: "Do you have any land records?" },
  { name: "employmentRegistration", label: "Do you have employment registration?" },
  { name: "academicDetails", label: "What are your academic details?" },
  // 8. Photograph / Biometric
  // photo is not auto-filled
  { name: "aadhaarLinkedMobile", label: "What is your mobile number linked to Aadhaar?" }
];

export default function VoiceProfileIntake({ onComplete }) {
  const audioRef = useRef(null);
  const [message, setMessage] = useState("Click the button to start!");
  const [isRecording, setIsRecording] = useState(false);
  const [currentField, setCurrentField] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const playTTS = async (text, lang = "en") => {
    setMessage(text);
    const res = await fetch(
      `http://localhost:8000/text-to-speech?text=${encodeURIComponent(text)}&lang=${lang}`
    );
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = url;
      return new Promise((resolve) => {
        audioRef.current.onended = resolve;
        audioRef.current.onloadedmetadata = async () => {
          try {
            await audioRef.current.play();
          } catch (e) {
            console.warn("Audio play interrupted:", e);
            resolve();
          }
        };
      });
    }
    return Promise.resolve();
  };

  const recordAndTranscribe = async () => {
    setIsRecording(true);
    setMessage("Listening...");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new window.MediaRecorder(stream);
    const audioChunks = [];
    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data);
    };
    return new Promise((resolve) => {
      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setMessage("Processing...");
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "audio.wav");
        const res = await fetch("http://localhost:8000/speech-to-text", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        resolve(data.transcript || "");
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
      }, 4000);
    });
  };

  const handleVoiceFlow = async () => {
    setMessage("Let's fill your profile by voice!");
    // setFormValues({});
    setCurrentField(0);
    setIsDone(false);

    await playTTS("Welcome! Let's fill your profile by voice.", "en");

    const answers = {};
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      await playTTS(field.label, "en");
      const answer = await recordAndTranscribe();
      answers[field.name] = answer;
      setMessage(`Heard: ${answer}`);
      setCurrentField(i + 1);
      await new Promise((res) => setTimeout(res, 1000));
      console.log("VoiceProfileIntake answers:", answers);
    }
    setIsDone(true);
    setMessage("All done! Review your details below.");
    if (onComplete) onComplete(answers);
  };

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
      <audio ref={audioRef} hidden />
      <h2>Voice Profile Intake</h2>
      <div style={{ margin: "1rem 0", color: "#2d6a4f" }}>{message}</div>
      {isRecording && <div style={{ color: "#b22222" }}>Listening...</div>}
      <button
        onClick={handleVoiceFlow}
        disabled={isRecording || currentField !== 0}
        style={{
          background: "#2d6a4f",
          color: "#fff",
          padding: "0.8rem 2rem",
          border: "none",
          borderRadius: 8,
          fontSize: 18,
          cursor: "pointer",
        }}
      >
        Start Voice Flow
      </button>
      {isDone && (
        <div style={{ marginTop: 24 }}>
          <h3>Profile complete!</h3>
          {/* No list of questions/fields here */}
        </div>
      )}
    </div>
  );
}
