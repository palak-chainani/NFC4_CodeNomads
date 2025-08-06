import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
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
    email: "",
    phone: "",
    emergencyContact: "",
    buildingBlock: "",
    flatNo: "",
    dateOfBirth: "",
    specialization: "",
    profilePic: "https://i.pravatar.cc/300",
  });

  const [selectedRole, setSelectedRole] = useState("");
  const [isMobile, setIsMobile] = useState(false);
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

  // Load profile data and check completion status
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileCompleted = localStorage.getItem('profileCompleted');
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        if (profileCompleted !== 'true') {
          // If profile is not completed, redirect to profile completion page
          navigate('/profile-completion');
          return;
        }

        // Fetch profile data from backend
        const response = await fetch('http://127.0.0.1:8000/api/profile/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });

        if (response.ok) {
          const profileData = await response.json();
          setProfile({
            fullName: profileData.fullName || "Anjali S.",
            email: profileData.email || "anjali.s@example.com",
            phone: profileData.phone || "+91 98765 43210",
            emergencyContact: profileData.emergencyContact || "+91 98765 43211",
            buildingBlock: profileData.buildingBlock || "B-Wing",
            flatNo: profileData.flatNo || "501",
            dateOfBirth: profileData.dateOfBirth || "1990-05-15",
            specialization: profileData.specialization || "Plumber",
            profilePic: profileData.profilePic || "https://i.pravatar.cc/300",
          });
          setSelectedRole(profileData.role || "admin");
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

  const handleEditClick = () => {
    navigate('/profile-edit');
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
      maxWidth: "900px",
      margin: "0 auto",
    },
    header: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "center" : "flex-start",
      marginBottom: "2rem",
      paddingBottom: "1.5rem",
      borderBottom: `1px solid ${palette.oliveGreen}`,
      position: "relative",
      textAlign: isMobile ? "center" : "left",
    },
    profileImageContainer: {
      position: "relative",
      marginRight: isMobile ? 0 : "2rem",
      marginBottom: isMobile ? "1rem" : 0
    },
    profileImage: {
      width: isMobile ? "100px" : "120px",
      height: isMobile ? "100px" : "120px",
      borderRadius: "50%",
      border: `4px solid ${palette.darkGreen}`,
      objectFit: "cover",
    },
    headerText: {
      flex: 1,
    },
    name: {
      color: palette.darkGreen,
      margin: "0 0 0.5rem 0",
      fontSize: isMobile ? "1.5rem" : "1.8rem",
      fontWeight: "600",
    },
    email: {
      color: palette.khaki,
      margin: "0 0 1rem 0",
      fontSize: "1rem",
    },
    editButton: {
      backgroundColor: "transparent",
      color: palette.darkGreen,
      border: `1px solid ${palette.darkGreen}`,
      padding: "0.5rem 1.5rem",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "500",
      fontSize: "0.9rem",
      transition: "all 0.2s ease",
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
    roleCard: {
      border: `2px solid ${palette.darkGreen}`,
      backgroundColor: "#f8f8f0",
      padding: "1.5rem",
      borderRadius: "12px",
      textAlign: "center",
      boxShadow: `0 0 0 4px ${palette.oliveGreen}15`,
      maxWidth: "300px",
      margin: "0 auto",
    },
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
    infoGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: "1.2rem",
    },
    infoField: {
      marginBottom: "1rem",
    },
    label: {
      display: "block",
      color: palette.darkGreen,
      marginBottom: "0.5rem",
      fontWeight: "500",
      fontSize: "0.95rem",
    },
    value: {
      color: palette.khaki,
      fontSize: "1rem",
      padding: "0.5rem 0",
      borderBottom: `1px solid ${palette.oliveGreen}30`,
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
        {/* Profile Header */}
        <header style={styles.header}>
          <div style={styles.profileImageContainer}>
            <img
              src={profile.profilePic}
              alt="Profile"
              style={styles.profileImage}
            />
          </div>
          <div style={styles.headerText}>
            <h1 style={styles.name}>{profile.fullName}</h1>
            <p style={styles.email}>{profile.email}</p>
            <button
              style={styles.editButton}
              onClick={handleEditClick}
            >
              Edit Profile
            </button>
          </div>
        </header>

        {/* Role Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.sectionTitleIcon}>👥</span>
            Your Role
          </h2>
          <div style={styles.roleCard}>
            <div style={styles.roleIcon}>
              {roles.find(role => role.id === selectedRole)?.icon || "👤"}
            </div>
            <h3 style={styles.roleName}>
              {roles.find(role => role.id === selectedRole)?.name || "Resident"}
            </h3>
            <p style={styles.roleDescription}>
              {roles.find(role => role.id === selectedRole)?.description || "Report issues and view community updates."}
            </p>
          </div>
        </section>

        {/* Personal Information Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.sectionTitleIcon}>📝</span>
            Personal Information
          </h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoField}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.value}>{profile.fullName}</div>
            </div>

            <div style={styles.infoField}>
              <label style={styles.label}>Date of Birth</label>
              <div style={styles.value}>{profile.dateOfBirth}</div>
            </div>

            <div style={styles.infoField}>
              <label style={styles.label}>Phone Number</label>
              <div style={styles.value}>{profile.phone}</div>
            </div>

            <div style={styles.infoField}>
              <label style={styles.label}>Emergency Contact</label>
              <div style={styles.value}>{profile.emergencyContact}</div>
            </div>

            <div style={styles.infoField}>
              <label style={styles.label}>Building / Block</label>
              <div style={styles.value}>{profile.buildingBlock}</div>
            </div>

            <div style={styles.infoField}>
              <label style={styles.label}>Flat Number</label>
              <div style={styles.value}>{profile.flatNo}</div>
            </div>

            {/* Conditional Field for Worker Role */}
            {selectedRole === "worker" && (
              <div style={styles.infoField}>
                <label style={styles.label}>Specialization</label>
                <div style={styles.value}>{profile.specialization}</div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;