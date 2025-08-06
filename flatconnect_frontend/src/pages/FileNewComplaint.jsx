import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  faPlus,
  faCamera,
  faHouse,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const FileNewComplaint = () => {



  let navigate = useNavigate();
  // Color Palette
  const palette = {
    darkGreen: "#0A4D0C",
    oliveGreen: "#819D67",
    khaki: "#B1AB86",
    cream: "#FEFAE0",
  };

  // State for form data
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    priority: "",
    location: "",
    description: "",
    files: [],
    consent: false,
  });

  // State for hover effects
  const [hoverStates, setHoverStates] = useState({
    fileUploadBox: false,
    chooseFilesBtn: false,
    clearBtn: false,
    submitBtn: false,
    tabButtons: [false, false],
    inputs: {},
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...Array.from(e.target.files)],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form fields
    if (!formData.title || !formData.category || !formData.priority || !formData.description || !formData.consent) {
      alert("Please fill out all required fields and provide consent.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token is missing. Please log in again.");
      return;
    }

    const categoryMap = {
      plumbing: "1",
      electrical: "2",
      cleaning: "3",
      security: "4",
      other: "5",
    };


    const priorityMap = {
      high: "3",
      medium: "2",
      low: "1",
    };

    // Prepare JSON payload
    const payload = {
      title: formData.title,
      description: formData.description,
      category: categoryMap[formData.category] || "5",
      priority: priorityMap[formData.priority] || "1",
    };

    // Debug payload
    console.log("Payload before geolocation:", JSON.stringify(payload, null, 2));

    // Handle geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          payload.latitude = position.coords.latitude.toFixed(3).toString();
          payload.longitude = position.coords.longitude.toFixed(3).toString();

          console.log("Final payload to be sent:", JSON.stringify(payload, null, 2));

          try {
            const response = await axios.post(
              "http://127.0.0.1:8000/issues/create/",
              payload,
              {
                headers: {
                  Authorization: `Token ${token}`,
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            console.log("Issue created:", response.data);
            alert("Complaint submitted successfully!");
            handleReset();
            navigate("/mycomplaints");
          } catch (error) {
            console.error("Error creating issue:", {
              status: error.response?.status,
              data: error.response?.data,
              message: error.message,
            });
            alert(`Failed to submit complaint: ${error.response?.data?.detail || JSON.stringify(error.response?.data) || error.message}`);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Geolocation access denied. Submitting without location coordinates.");
          trySubmitWithoutGeolocation(payload, token);
        }
      );
    } else {
      alert("Geolocation not supported. Submitting without location coordinates.");
      trySubmitWithoutGeolocation(payload, token);
    }
  };

  const trySubmitWithoutGeolocation = async (payload, token) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/issues/create/",
        payload,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Issue created without geolocation:", response.data);
      alert("Complaint submitted successfully!");
      handleReset();
      navigate("/mycomplaints");
    } catch (error) {
      console.error("Error creating issue without geolocation:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      alert(`Failed to submit complaint: ${error.response?.data?.detail || JSON.stringify(error.response?.data) || error.message}`);
    }
  };

  const handleReset = () => {
    setFormData({
      title: "",
      category: "",
      priority: "",
      location: "",
      description: "",
      files: [],
      consent: false,
    });
  };

  const handleHover = (element, isHovering) => {
    setHoverStates((prev) => ({
      ...prev,
      [element]: isHovering,
    }));
  };

  const handleTabHover = (index, isHovering) => {
    setHoverStates((prev) => {
      const newTabButtons = [...prev.tabButtons];
      newTabButtons[index] = isHovering;
      return {
        ...prev,
        tabButtons: newTabButtons,
      };
    });
  };

  const handleInputFocus = (name, isFocused) => {
    setHoverStates((prev) => ({
      ...prev,
      inputs: {
        ...prev.inputs,
        [name]: isFocused,
      },
    }));
  };

  // Component Styles
  const styles = {
    pageContainer: {
      backgroundColor: palette.cream,
      minHeight: "100vh",
      padding: "20px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    mainHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 25px",
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
      marginBottom: "25px",
    },
    logoSection: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
    },
    logoIcon: {
      color: palette.darkGreen,
      fontSize: "24px",
    },
    logoText: {
      color: palette.darkGreen,
    },
    logoTitle: {
      margin: "0",
      fontSize: "18px",
      fontWeight: "600",
    },
    logoSubtitle: {
      margin: "0",
      fontSize: "12px",
      color: palette.khaki,
    },
    userSection: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
    },
    userName: {
      color: palette.darkGreen,
      fontWeight: "500",
      fontSize: "14px",
    },
    userIcon: {
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      backgroundColor: `${palette.darkGreen}20`,
      color: palette.darkGreen,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    statsSection: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "15px",
      marginBottom: "25px",
    },
    statCard: {
      backgroundColor: "white",
      borderRadius: "10px",
      padding: "15px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
      textAlign: "center",
    },
    statValue: {
      color: palette.darkGreen,
      fontSize: "20px",
      fontWeight: "600",
      margin: "0 0 5px 0",
    },
    statLabel: {
      color: palette.khaki,
      fontSize: "12px",
      margin: "0",
    },
    formContentWrapper: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "25px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    },
    tabButtons: {
      display: "flex",
      gap: "10px",
      marginBottom: "25px",
    },
    tabButton: (index) => ({
      padding: "10px 20px",
      backgroundColor: index === 1 ? `${palette.darkGreen}10` : "transparent",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "500",
      fontSize: "14px",
      color: index === 1 ? palette.darkGreen : palette.khaki,
      transition: "all 0.2s ease",
      ...(hoverStates.tabButtons[index] && {
        backgroundColor: `${palette.darkGreen}05`,
        color: palette.darkGreen,
      }),
    }),
    formHeader: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
      marginBottom: "25px",
    },
    formIcon: {
      color: palette.darkGreen,
      fontSize: "20px",
    },
    formTitle: {
      color: palette.darkGreen,
      margin: "0",
      fontSize: "20px",
      fontWeight: "600",
    },
    formSubtitle: {
      color: palette.khaki,
      margin: "5px 0 0 0",
      fontSize: "14px",
    },
    complaintForm: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    formRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    fullWidth: {
      gridColumn: "1 / -1",
    },
    label: {
      color: palette.darkGreen,
      fontSize: "14px",
      fontWeight: "500",
    },
    requiredLabel: {
      color: "#e53e3e",
    },
    input: (name) => ({
      padding: "12px 15px",
      border: `1px solid ${palette.oliveGreen}50`,
      borderRadius: "8px",
      fontSize: "14px",
      transition: "all 0.2s ease",
      ...(hoverStates.inputs[name] && {
        outline: "none",
        borderColor: palette.darkGreen,
        boxShadow: `0 0 0 3px ${palette.oliveGreen}20`,
      }),
    }),
    select: (name) => ({
      padding: "12px 15px",
      border: `1px solid ${palette.oliveGreen}50`,
      borderRadius: "8px",
      fontSize: "14px",
      appearance: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%230A4D0C' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 15px center",
      backgroundSize: "12px",
      transition: "all 0.2s ease",
      ...(hoverStates.inputs[name] && {
        outline: "none",
        borderColor: palette.darkGreen,
        boxShadow: `0 0 0 3px ${palette.oliveGreen}20`,
      }),
    }),
    textarea: (name) => ({
      padding: "12px 15px",
      border: `1px solid ${palette.oliveGreen}50`,
      borderRadius: "8px",
      fontSize: "14px",
      minHeight: "100px",
      resize: "vertical",
      transition: "all 0.2s ease",
      ...(hoverStates.inputs[name] && {
        outline: "none",
        borderColor: palette.darkGreen,
        boxShadow: `0 0 0 3px ${palette.oliveGreen}20`,
      }),
    }),
    fileUploadBox: {
      border: `2px dashed ${
        hoverStates.fileUploadBox
          ? palette.darkGreen
          : `${palette.oliveGreen}50`
      }`,
      borderRadius: "8px",
      padding: "30px",
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.2s ease",
      backgroundColor: hoverStates.fileUploadBox
        ? `${palette.darkGreen}05`
        : "transparent",
    },
    uploadIcon: {
      color: palette.khaki,
      fontSize: "28px",
      marginBottom: "10px",
    },
    uploadText: {
      color: palette.darkGreen,
      margin: "0 0 5px 0",
      fontSize: "14px",
    },
    uploadSubtext: {
      color: palette.khaki,
      margin: "0 0 15px 0",
      fontSize: "12px",
    },
    chooseFilesBtn: {
      backgroundColor: hoverStates.chooseFilesBtn
        ? `${palette.darkGreen}10`
        : "transparent",
      color: palette.darkGreen,
      border: `1px solid ${palette.darkGreen}`,
      borderRadius: "6px",
      padding: "8px 20px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    checkboxGroup: {
      display: "flex",
      alignItems: "flex-start",
      gap: "10px",
    },
    checkbox: {
      marginTop: "3px",
      accentColor: palette.darkGreen,
    },
    checkboxLabel: {
      color: palette.darkGreen,
      fontSize: "14px",
    },
    formActions: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "15px",
      marginTop: "20px",
    },
    submitBtn: {
      backgroundColor: hoverStates.submitBtn ? "#08380a" : palette.darkGreen,
      color: palette.cream,
      border: "none",
      borderRadius: "8px",
      padding: "12px 25px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      ...(hoverStates.submitBtn && {
        transform: "translateY(-1px)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }),
    },
    clearBtn: {
      backgroundColor: hoverStates.clearBtn
        ? `${palette.darkGreen}10`
        : "transparent",
      color: palette.darkGreen,
      border: `1px solid ${palette.darkGreen}`,
      borderRadius: "8px",
      padding: "12px 25px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      ...(hoverStates.clearBtn && {
        transform: "translateY(-1px)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }),
    },
  };

  return (
    <div style={styles.pageContainer}>
      {/* Form Content */}
      <div style={styles.formContentWrapper}>
        <div style={styles.tabButtons}>
          <button
            onClick={() => navigate("/mycomplaints")}
            style={styles.tabButton(0)}
            onMouseEnter={() => handleTabHover(0, true)}
            onMouseLeave={() => handleTabHover(0, false)}
          >
            My Complaints
          </button>
          <button
            style={styles.tabButton(1)}
            onMouseEnter={() => handleTabHover(1, true)}
            onMouseLeave={() => handleTabHover(1, false)}
          >
            File New Complaint
          </button>
        </div>

        <div className="file-new-complaint-form-area">
          <div style={styles.formHeader}>
            <FontAwesomeIcon icon={faPlus} style={styles.formIcon} />
            <div>
              <h2 style={styles.formTitle}>File New Complaint</h2>
              <p style={styles.formSubtitle}>
                Submit a new complaint about issues in your society.
              </p>
            </div>
          </div>

          <form
            style={styles.complaintForm}
            onSubmit={handleSubmit}
            onReset={handleReset}
          >
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="title">
                  Complaint Title <span style={styles.requiredLabel}>*</span>
                </label>
                <input
                  style={styles.input("title")}
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Brief description of the issue"
                  required
                  onFocus={() => handleInputFocus("title", true)}
                  onBlur={() => handleInputFocus("title", false)}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="category">
                  Category <span style={styles.requiredLabel}>*</span>
                </label>
                <select
                  style={styles.select("category")}
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  onFocus={() => handleInputFocus("category", true)}
                  onBlur={() => handleInputFocus("category", false)}
                >
                  <option value="">Select category</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="security">Security</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="priority">
                  Priority Level <span style={styles.requiredLabel}>*</span>
                </label>
                <select
                  style={styles.select("priority")}
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  required
                  onFocus={() => handleInputFocus("priority", true)}
                  onBlur={() => handleInputFocus("priority", false)}
                >
                  <option value="">Select priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="location">
                  Location/Area <span style={styles.requiredLabel}>*</span>
                </label>
                <input
                  style={styles.input("location")}
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Specify exact location"
                  required
                  onFocus={() => handleInputFocus("location", true)}
                  onBlur={() => handleInputFocus("location", false)}
                />
              </div>
            </div>

            <div style={{ ...styles.formGroup, ...styles.fullWidth }}>
              <label style={styles.label} htmlFor="description">
                Detailed Description <span style={styles.requiredLabel}>*</span>
              </label>
              <textarea
                style={styles.textarea("description")}
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide a detailed description of the issue, including any relevant context..."
                required
                onFocus={() => handleInputFocus("description", true)}
                onBlur={() => handleInputFocus("description", false)}
              ></textarea>
            </div>

            <div style={{ ...styles.formGroup, ...styles.fullWidth }}>
              <label style={styles.label}>
                Attach Photos/Videos (Optional)
              </label>
              <label
                htmlFor="file-upload"
                style={styles.fileUploadBox}
                onMouseEnter={() => handleHover("fileUploadBox", true)}
                onMouseLeave={() => handleHover("fileUploadBox", false)}
              >
                <FontAwesomeIcon icon={faCamera} style={styles.uploadIcon} />
                <p style={styles.uploadText}>
                  Click to upload or drag and drop
                </p>
                <p style={styles.uploadSubtext}>
                  PNG, JPG, MP4 up to 10MB each
                </p>
                <button
                  type="button"
                  style={styles.chooseFilesBtn}
                  onMouseEnter={() => handleHover("chooseFilesBtn", true)}
                  onMouseLeave={() => handleHover("chooseFilesBtn", false)}
                >
                  Choose Files
                </button>
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  accept="image/png,image/jpeg,video/mp4"
                />
              </label>
              {formData.files.length > 0 && (
                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "12px",
                    color: palette.darkGreen,
                  }}
                >
                  {formData.files.length} file(s) selected
                </div>
              )}
            </div>

            <div
              style={{
                ...styles.formGroup,
                ...styles.fullWidth,
                ...styles.checkboxGroup,
              }}
            >
              <input
                style={styles.checkbox}
                type="checkbox"
                id="consent"
                name="consent"
                checked={formData.consent}
                onChange={handleInputChange}
                required
              />
              <label style={styles.checkboxLabel} htmlFor="consent">
                I confirm that the information provided is accurate and I
                understand that false complaints may result in account
                restrictions.
              </label>
            </div>

            <div style={styles.formActions}>
              <button
                type="reset"
                style={styles.clearBtn}
                onMouseEnter={() => handleHover("clearBtn", true)}
                onMouseLeave={() => handleHover("clearBtn", false)}
              >
                Clear Form
              </button>
              <button
                type="submit"
                style={styles.submitBtn}
                onMouseEnter={() => handleHover("submitBtn", true)}
                onMouseLeave={() => handleHover("submitBtn", false)}
              >
                Submit Complaint
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FileNewComplaint;