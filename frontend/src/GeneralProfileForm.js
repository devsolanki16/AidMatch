import React, { useState, useEffect } from "react";
import "./GeneralProfileForm.css";

export default function GeneralProfileForm({ onSubmit, initialValues }) {
  const [formValues, setFormValues] = useState({});

  // Only update formValues when initialValues changes (from AI)
  useEffect(() => {
    if (initialValues) {
      setFormValues(initialValues);
    }
  }, [initialValues]);

  const handleChange = (field, value) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formValues);
  };

  return (
    <form onSubmit={handleSubmit} className="general-profile-form">
      <h2>General Application Form</h2>
      {/* 1. Personal Information */}
      <label>Full Name
        <input type="text" value={formValues.fullName || ""} onChange={e => handleChange("fullName", e.target.value)} />
      </label>
      <label>Date of Birth / Age
        <input type="date" value={formValues.dob || ""} onChange={e => handleChange("dob", e.target.value)} />
      </label>
      <label>Gender
        <select value={formValues.gender || ""} onChange={e => handleChange("gender", e.target.value)}>
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </label>
      <label>Mobile Number
        <input type="tel" value={formValues.mobileNumber || ""} onChange={e => handleChange("mobileNumber", e.target.value)} />
      </label>
      <label>Email Address
        <input type="email" value={formValues.email || ""} onChange={e => handleChange("email", e.target.value)} />
      </label>

      {/* 2. Address & Residency Details */}
      <label>Present Address
        <input type="text" value={formValues.presentAddress || ""} onChange={e => handleChange("presentAddress", e.target.value)} />
      </label>
      <label>Permanent Address
        <input type="text" value={formValues.permanentAddress || ""} onChange={e => handleChange("permanentAddress", e.target.value)} />
      </label>
      <label>Residency Proof
        <input type="text" value={formValues.residencyProof || ""} onChange={e => handleChange("residencyProof", e.target.value)} />
      </label>
      <label>Duration of Residence (years)
        <input type="number" min="0" value={formValues.residenceDuration || ""} onChange={e => handleChange("residenceDuration", e.target.value)} />
      </label>

      {/* 3. Demographic / Social Category */}
      <label>Caste Status
        <select value={formValues.casteStatus || ""} onChange={e => handleChange("casteStatus", e.target.value)}>
          <option value="">Select caste</option>
          <option value="General">General</option>
          <option value="OBC">OBC</option>
          <option value="SC">SC</option>
          <option value="ST">ST</option>
        </select>
      </label>
      <label>Disability Status
        <select value={formValues.disabilityStatus || ""} onChange={e => handleChange("disabilityStatus", e.target.value)}>
          <option value="">Select</option>
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      </label>
      <label>Nativity Information
        <input type="text" value={formValues.nativity || ""} onChange={e => handleChange("nativity", e.target.value)} />
      </label>

      {/* 4. Economic & Occupational Details */}
      <label>Annual Income / Income Bracket
        <input type="text" value={formValues.annualIncome || ""} onChange={e => handleChange("annualIncome", e.target.value)} />
      </label>
      <label>Occupation
        <input type="text" value={formValues.occupation || ""} onChange={e => handleChange("occupation", e.target.value)} />
      </label>
      <label>Landholding Proof
        <input type="text" value={formValues.landholdingProof || ""} onChange={e => handleChange("landholdingProof", e.target.value)} />
      </label>

      {/* 5. Banking Information */}
      <label>Bank Account Number
        <input type="text" value={formValues.bankAccountNumber || ""} onChange={e => handleChange("bankAccountNumber", e.target.value)} />
      </label>
      <label>IFSC Code
        <input type="text" value={formValues.ifscCode || ""} onChange={e => handleChange("ifscCode", e.target.value)} />
      </label>
      <label>Cancelled Cheque / Passbook
        <input type="text" value={formValues.cancelledCheque || ""} onChange={e => handleChange("cancelledCheque", e.target.value)} />
      </label>

      {/* 6. Identity & Certificate Documents */}
      <label>ID Proof
        <input type="text" value={formValues.idProof || ""} onChange={e => handleChange("idProof", e.target.value)} />
      </label>
      <label>Birth/Age Proof
        <input type="text" value={formValues.birthProof || ""} onChange={e => handleChange("birthProof", e.target.value)} />
      </label>
      <label>Social Certificates
        <input type="text" value={formValues.socialCertificates || ""} onChange={e => handleChange("socialCertificates", e.target.value)} />
      </label>
      <label>Special Scheme Docs
        <input type="text" value={formValues.specialSchemeDocs || ""} onChange={e => handleChange("specialSchemeDocs", e.target.value)} />
      </label>

      {/* 7. Scheme-Specific or Asset-Related Details */}
      <label>Land Records
        <input type="text" value={formValues.landRecords || ""} onChange={e => handleChange("landRecords", e.target.value)} />
      </label>
      <label>Employment Registration
        <input type="text" value={formValues.employmentRegistration || ""} onChange={e => handleChange("employmentRegistration", e.target.value)} />
      </label>
      <label>Academic Details
        <input type="text" value={formValues.academicDetails || ""} onChange={e => handleChange("academicDetails", e.target.value)} />
      </label>

      {/* 8. Photograph / Biometric */}
      <label>Recent Passport-size Photograph
        <input type="file" accept="image/*" />
      </label>
      <label>Mobile Number Linked to Aadhaar
        <input type="tel" value={formValues.aadhaarLinkedMobile || ""} onChange={e => handleChange("aadhaarLinkedMobile", e.target.value)} />
      </label>

      <button type="submit" className="submit-btn">
        Submit
      </button>
    </form>
  );
} 