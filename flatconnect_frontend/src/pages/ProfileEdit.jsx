import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProfileEdit = () => {
  const navigate = useNavigate();
  
  // Color Palette
  const palette = {
    darkGreen: "#0A4D0C",
    oliveGreen: "#819D67",
    khaki: "#B1AB86",
    cream: "#FEFAE0",
  };

  // State for user profile data
  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    emergencyContact: "",
    buildingBlock: "",
    flatNo: "",
    dateOfBirth: "",
    specialization: "", // Relevant only for 'worker' role
  });

  const [selectedRole, setSelectedRole] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch existing profile data from backend
        const response = await fetch('http://127.0.0.1:8000/api/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const profileData = await response.json();
          setProfile({
            fullName: profileData.fullName || "",
            phone: profileData.phone || "",
            emergencyContact: profileData.emergencyContact || "",
            buildingBlock: profileData.buildingBlock || "",
            flatNo: profileData.flatNo || "",
            dateOfBirth: profileData.dateOfBirth || "",
            specialization: profileData.specialization || "",
          });
          setSelectedRole(profileData.role || "");
        } else {
          // If profile doesn't exist, redirect to profile completion
          navigate('/profile-completion');
          return;
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // If error, redirect to profile completion
        navigate('/profile-completion');
        return;
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!profile.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    if (!profile.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    
    if (!profile.emergencyContact.trim()) {
      newErrors.emergencyContact = "Emergency contact is required";
    }
    
    if (!profile.buildingBlock.trim()) {
      newErrors.buildingBlock = "Building/Block is required";
    }
    
    if (!profile.flatNo.trim()) {
      newErrors.flatNo = "Flat number is required";
    }
    
    if (!profile.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }
    
    if (!selectedRole) {
      newErrors.role = "Please select a role";
    }
    
    if (selectedRole === "worker" && !profile.specialization.trim()) {
      newErrors.specialization = "Specialization is required for workers";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error("Not authenticated");
      }
      
      // Prepare profile data to send to backend
      const profileData = {
        ...profile,
        role: selectedRole,
      };
      
      // Update profile data in backend
      const response = await fetch('http://127.0.0.1:8000/api/profile/update/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      alert('Profile updated successfully!');
      navigate('/profile'); // Navigate back to profile view
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile'); // Navigate back to profile view
  };

  const roles = [
    {
      id: "admin",
      name: "Admin",
      icon: "🛡",
      description: "Committee member with full management access.",
    },
    {
      id: "user",
      name: "Resident",
      icon: "👤",
      description: "Report issues and view community updates.",
    },
    {
      id: "worker",
      name: "Worker",
      icon: "🔧",
      description: "Maintenance staff who resolves assigned tasks.",
    },
  ];

  // Component Styles
  const styles = {
    pageContainer: {
      backgroundColor: palette.cream,
      padding: isMobile ? "1rem 0.5rem" : "2rem 1rem",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      minHeight: "100vh",
    },
    card: {
      backgroundColor: "white",
      borderRadius: "16px",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
      padding: isMobile ? "1.5rem" : "2.5rem",
      maxWidth: "800px",
      margin: "0 auto",
    },
    header: {
      textAlign: "center",
      marginBottom: "2rem",
      paddingBottom: "1.5rem",
      borderBottom: `1px solid ${palette.oliveGreen}`,
    },
    title: {
      color: palette.darkGreen,
      fontSize: isMobile ? "1.8rem" : "2.2rem",
      fontWeight: "700",
      margin: "0 0 0.5rem 0",
    },
    subtitle: {
      color: palette.khaki,
      fontSize: "1.1rem",
      margin: "0",
      lineHeight: "1.5",
    },
    section: {
      marginBottom: "2rem",
    },
    sectionTitle: {
      color: palette.darkGreen,
      fontSize: isMobile ? "1.2rem" : "1.3rem",
      fontWeight: "600",
      marginBottom: "1.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: isMobile ? "center" : "flex-start",
    },
    sectionTitleIcon: {
      marginRight: "0.8rem",
      fontSize: "1.2rem",
    },
    roleGrid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "1.2rem",
      marginBottom: "1rem",
    },
    roleCard: (roleId) => ({
      border: `2px solid ${selectedRole === roleId ? palette.darkGreen : palette.oliveGreen + '30'}`,
      backgroundColor: selectedRole === roleId ? "#f8f8f0" : "white",
      padding: "1.5rem",
      borderRadius: "12px",
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: selectedRole === roleId ? `0 0 0 4px ${palette.oliveGreen}15` : "none",
    }),
    roleIcon: {
      fontSize: "2.2rem",
      marginBottom: "1rem",
    },
    roleName: {
      color: palette.darkGreen,
      margin: "0.5rem 0",
      fontWeight: "600",
    },
    roleDescription: {
      color: palette.khaki,
      fontSize: "0.9rem",
      margin: 0,
      lineHeight: "1.5",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: "1.2rem",
    },
    formField: {
      marginBottom: "1rem",
    },
    fullWidthField: {
      gridColumn: "1 / -1",
    },
    label: {
      display: "block",
      color: palette.darkGreen,
      marginBottom: "0.5rem",
      fontWeight: "500",
      fontSize: "0.95rem",
    },
    input: {
      width: "100%",
      padding: "0.8rem 1rem",
      border: "1px solid #ddd",
      borderRadius: "8px",
      backgroundColor: "white",
      fontSize: "0.95rem",
      transition: "all 0.2s ease",
    },
    inputError: {
      border: "1px solid #dc3545",
    },
    errorMessage: {
      color: "#dc3545",
      fontSize: "0.85rem",
      marginTop: "0.25rem",
    },
    buttonGroup: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "center",
      gap: "1rem",
      marginTop: "2rem",
    },
    submitButton: {
      backgroundColor: palette.darkGreen,
      color: palette.cream,
      fontWeight: "600",
      padding: "1rem 2.5rem",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "1rem",
      transition: "all 0.2s ease",
      width: isMobile ? "100%" : "auto",
      opacity: isSubmitting ? 0.7 : 1,
    },
    cancelButton: {
      backgroundColor: "transparent",
      color: palette.darkGreen,
      fontWeight: "600",
      padding: "1rem 2.5rem",
      border: `1px solid ${palette.darkGreen}`,
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "1rem",
      transition: "all 0.2s ease",
      width: isMobile ? "100%" : "auto",
    },
    loadingSpinner: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "200px",
      fontSize: "1.2rem",
      color: palette.darkGreen,
    },
  };

  if (isLoading) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.card}>
          <div style={styles.loadingSpinner}>
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        {/* Header */}
        <header style={styles.header}>
          <h1 style={styles.title}>Edit Profile</h1>
          <p style={styles.subtitle}>
            Update your profile information
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          {/* Role Selection Section */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <span style={styles.sectionTitleIcon}>👥</span>
              Select Your Role *
            </h2>
            <div style={styles.roleGrid}>
              {roles.map((role) => (
                <div
                  key={role.id}
                  style={styles.roleCard(role.id)}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div style={styles.roleIcon}>{role.icon}</div>
                  <h3 style={styles.roleName}>{role.name}</h3>
                  <p style={styles.roleDescription}>{role.description}</p>
                </div>
              ))}
            </div>
            {errors.role && <p style={styles.errorMessage}>{errors.role}</p>}
          </section>

          {/* Personal Information Section */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <span style={styles.sectionTitleIcon}>📝</span>
              Personal Information
            </h2>
            <div style={styles.formGrid}>
              <div style={styles.formField}>
                <label style={styles.label} htmlFor="fullName">
                  Full Name *
                </label>
                <input
                  style={{
                    ...styles.input,
                    ...(errors.fullName && styles.inputError)
                  }}
                  type="text"
                  name="fullName"
                  id="fullName"
                  value={profile.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
                {errors.fullName && <p style={styles.errorMessage}>{errors.fullName}</p>}
              </div>

              <div style={styles.formField}>
                <label style={styles.label} htmlFor="dateOfBirth">
                  Date of Birth *
                </label>
                <input
                  style={{
                    ...styles.input,
                    ...(errors.dateOfBirth && styles.inputError)
                  }}
                  type="date"
                  name="dateOfBirth"
                  id="dateOfBirth"
                  value={profile.dateOfBirth}
                  onChange={handleInputChange}
                />
                {errors.dateOfBirth && <p style={styles.errorMessage}>{errors.dateOfBirth}</p>}
              </div>

              <div style={styles.formField}>
                <label style={styles.label} htmlFor="phone">
                  Phone Number *
                </label>
                <input
                  style={{
                    ...styles.input,
                    ...(errors.phone && styles.inputError)
                  }}
                  type="tel"
                  name="phone"
                  id="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
                {errors.phone && <p style={styles.errorMessage}>{errors.phone}</p>}
              </div>

              <div style={styles.formField}>
                <label style={styles.label} htmlFor="emergencyContact">
                  Emergency Contact *
                </label>
                <input
                  style={{
                    ...styles.input,
                    ...(errors.emergencyContact && styles.inputError)
                  }}
                  type="tel"
                  name="emergencyContact"
                  id="emergencyContact"
                  value={profile.emergencyContact}
                  onChange={handleInputChange}
                  placeholder="Enter emergency contact"
                />
                {errors.emergencyContact && <p style={styles.errorMessage}>{errors.emergencyContact}</p>}
              </div>

              <div style={styles.formField}>
                <label style={styles.label} htmlFor="buildingBlock">
                  Building / Block *
                </label>
                <input
                  style={{
                    ...styles.input,
                    ...(errors.buildingBlock && styles.inputError)
                  }}
                  type="text"
                  name="buildingBlock"
                  id="buildingBlock"
                  value={profile.buildingBlock}
                  onChange={handleInputChange}
                  placeholder="e.g., A-Wing, B-Block"
                />
                {errors.buildingBlock && <p style={styles.errorMessage}>{errors.buildingBlock}</p>}
              </div>

              <div style={styles.formField}>
                <label style={styles.label} htmlFor="flatNo">
                  Flat Number *
                </label>
                <input
                  style={{
                    ...styles.input,
                    ...(errors.flatNo && styles.inputError)
                  }}
                  type="text"
                  name="flatNo"
                  id="flatNo"
                  value={profile.flatNo}
                  onChange={handleInputChange}
                  placeholder="e.g., 101, 2A"
                />
                {errors.flatNo && <p style={styles.errorMessage}>{errors.flatNo}</p>}
              </div>

              {/* Conditional Field for Worker Role */}
              {selectedRole === "worker" && (
                <div style={{ ...styles.formField, ...styles.fullWidthField }}>
                  <label style={styles.label} htmlFor="specialization">
                    Specialization *
                  </label>
                  <input
                    style={{
                      ...styles.input,
                      ...(errors.specialization && styles.inputError)
                    }}
                    type="text"
                    name="specialization"
                    id="specialization"
                    value={profile.specialization}
                    onChange={handleInputChange}
                    placeholder="e.g., Plumber, Electrician, Carpenter"
                  />
                  {errors.specialization && <p style={styles.errorMessage}>{errors.specialization}</p>}
                </div>
              )}
            </div>
          </section>

          <div style={styles.buttonGroup}>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit; 