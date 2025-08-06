import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // 👈 Imported axios

const ProfileCompletion = () => {
  console.log("ProfileCompletion - Component loaded");
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

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Check if profile has already been completed and if user is authenticated
  useEffect(() => {
    console.log("ProfileCompletion - useEffect triggered");
    const profileCompleted = localStorage.getItem('profileCompleted');
    const token = localStorage.getItem('token');
    
    console.log("ProfileCompletion - Token:", token);
    console.log("ProfileCompletion - Profile completed:", profileCompleted);
    console.log("ProfileCompletion - All localStorage items:", {
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user'),
      role: localStorage.getItem('role'),
      profileCompleted: localStorage.getItem('profileCompleted')
    });
    
    if (!token) {
      console.log("ProfileCompletion - No token found, redirecting to login");
      navigate('/login');
      return;
    }
    
    // Check if there's already a profile on the backend
    const checkExistingProfile = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const profileData = await response.json();
          console.log("ProfileCompletion - Existing profile found:", profileData);
          
          // If profile has required fields, mark as completed
          if (profileData.flat_number && profileData.building_block && profileData.phone_number) {
            console.log("ProfileCompletion - Profile appears to be complete, redirecting");
            localStorage.setItem('profileCompleted', 'true');
            const userRole = localStorage.getItem('role');
            
            if (userRole === 'admin') {
              navigate('/dashboard');
            } else if (userRole === 'member') {
              navigate('/mycomplaints');
            } else if (userRole === 'worker') {
              navigate('/workerdashboard');
            } else {
              navigate('/dashboard');
            }
            return;
          }
        }
      } catch (error) {
        console.log("ProfileCompletion - No existing profile or error:", error);
      }
    };
    
    if (profileCompleted === 'true') {
      console.log("ProfileCompletion - Profile already completed, checking role for navigation");
      const userRole = localStorage.getItem('role');
      console.log("User role for navigation:", userRole);
      
      if (userRole === 'admin') {
        console.log("ProfileCompletion - Redirecting admin to dashboard");
        navigate('/dashboard');
      } else if (userRole === 'member') {
        console.log("ProfileCompletion - Redirecting member to mycomplaints");
        navigate('/mycomplaints');
      } else if (userRole === 'worker') {
        console.log("ProfileCompletion - Redirecting worker to workerdashboard");
        navigate('/workerdashboard');
      } else {
        console.log("ProfileCompletion - Redirecting to default dashboard");
        navigate('/dashboard');
      }
    } else {
      // Check for existing profile on backend
      checkExistingProfile();
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!profile.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!profile.phone.trim()) newErrors.phone = "Phone number is required";
    if (!profile.emergencyContact.trim()) newErrors.emergencyContact = "Emergency contact is required";
    if (!profile.buildingBlock.trim()) newErrors.buildingBlock = "Building/Block is required";
    if (!profile.flatNo.trim()) newErrors.flatNo = "Flat number is required";
    if (!profile.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!selectedRole) newErrors.role = "Please select a role";
    if (selectedRole === "worker" && !profile.specialization.trim()) {
      newErrors.specialization = "Specialization is required for workers";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      console.log("Token:", token);
      if (!token) throw new Error("Missing token");

      const [firstName, ...rest] = profile.fullName.split(" ");
      const lastName = rest.join(" ");

      // Prepare profile data to send to backend (matching ProfileEdit format)
      const profileData = {
        ...profile,
        role: selectedRole === "user" ? "member" : selectedRole,
        // Add the structured fields as well
        first_name: firstName || profile.fullName || "",
        last_name: lastName || "User",
        flat_number: profile.flatNo,
        building_block: profile.buildingBlock,
        phone_number: profile.phone,
        emergency_contact: profile.emergencyContact,
        date_of_birth: profile.dateOfBirth,
      };
      console.log("Profile data to send:", profileData);
      console.log("Token being used:", token);
      console.log("Full name entered:", profile.fullName);
      console.log("First name extracted:", firstName);
      console.log("Last name extracted:", lastName);
      console.log("Selected role in frontend:", selectedRole);
      console.log("Role being sent to backend:", selectedRole === "user" ? "member" : selectedRole);

      const response = await axios.put("http://127.0.0.1:8000/api/auth/profile/", profileData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Profile update response:", response.data);
      console.log("Profile update status:", response.status);
      console.log("Profile response structure:", {
        role: response.data.role,
        first_name: response.data.first_name,
        last_name: response.data.last_name
      });
      
      // Update the role in localStorage with the selected role
      const updatedRole = selectedRole === "user" ? "member" : selectedRole;
      localStorage.setItem('role', updatedRole);
      console.log("Updated role in localStorage:", updatedRole);
      
      // Mark profile as completed in localStorage
      localStorage.setItem('profileCompleted', 'true');
      
      // Get user role from localStorage (should now be the updated role)
      const userRole = localStorage.getItem('role');
      console.log("User role after profile completion:", userRole);
      
      alert('Profile completed successfully!');
      
      // Navigate based on user role
      if (userRole === 'admin') {
        console.log("Navigating admin to dashboard");
        navigate('/dashboard');
      } else if (userRole === 'member') {
        console.log("Navigating member to mycomplaints");
        navigate('/mycomplaints');
      } else if (userRole === 'worker') {
        console.log("Navigating worker to workerdashboard");
        navigate('/workerdashboard');
      } else {
        console.log("Navigating to default dashboard");
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        
        // Handle specific field errors
        const errorData = error.response.data;
        let errorMessage = "Failed to update profile:\n";
        
        if (errorData.last_name) {
          errorMessage += `Last Name: ${errorData.last_name[0]}\n`;
        }
        if (errorData.first_name) {
          errorMessage += `First Name: ${errorData.first_name[0]}\n`;
        }
        if (errorData.flat_number) {
          errorMessage += `Flat Number: ${errorData.flat_number[0]}\n`;
        }
        if (errorData.building_block) {
          errorMessage += `Building Block: ${errorData.building_block[0]}\n`;
        }
        if (errorData.phone_number) {
          errorMessage += `Phone Number: ${errorData.phone_number[0]}\n`;
        }
        if (errorData.emergency_contact) {
          errorMessage += `Emergency Contact: ${errorData.emergency_contact[0]}\n`;
        }
        if (errorData.date_of_birth) {
          errorMessage += `Date of Birth: ${errorData.date_of_birth[0]}\n`;
        }
        if (errorData.role) {
          errorMessage += `Role: ${errorData.role[0]}\n`;
        }
        if (errorData.detail) {
          errorMessage += `Detail: ${errorData.detail}\n`;
        }
        
        alert(errorMessage);
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
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

  // 🟩 Styles remain exactly the same (not repeated for brevity)

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
    skipButton: {
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
  };

  console.log("ProfileCompletion - About to render");
  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        {/* Header */}
        <header style={styles.header}>
          <h1 style={styles.title}>Complete Your Profile</h1>
          <p style={styles.subtitle}>
            Please provide your information to complete your account setup
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
              type="submit"
              style={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Complete Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletion;
