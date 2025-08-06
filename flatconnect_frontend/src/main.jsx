// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/Login.jsx";
import SignupPage from "./pages/Signup.jsx";
import ProfilePage from "./pages/ProfilePage.jsx"; // Import the new profile page
import ProfileCompletion from "./pages/ProfileCompletion.jsx"; // Import the profile completion page
import ProfileEdit from "./pages/ProfileEdit.jsx"; // Import the profile edit page
// import UserDashboard from "./pages/UserDashboard.jsx"; // Import the user dashboard page

// Import the new dashboard components
import DashboardLayout from "./pages/DashboardLayout.jsx";
import DashboardHomePage from "./pages/DashboardHomePage.jsx";
import MyComplaintsPage from "./pages/AllComplaints.jsx"; // Corrected name to be consistent

import "./index.css";
import FileNewComplaint from "./pages/FileNewComplaint.jsx";
import AllComplaints from "./pages/AllComplaints.jsx";
import MyComplaints from "./pages/MyComplaints.jsx"; // Import the MyComplaints component
import WorkerDashboard from "./pages/WorkerDashboard.jsx";
import AdminTaskAssignment from "./pages/AdminTaskAssignment.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "profile", element: <ProfilePage /> }, // Add this route
      { path: "profile-completion", element: <ProfileCompletion /> }, // Add profile completion route
      { path: "filenewcomplaint", element: <FileNewComplaint /> }, // Add file new complaint route
      { path: "profile-edit", element: <ProfileEdit /> },
      {
        path: "dashboard",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardHomePage /> },
          { path: "all-complaints", element: <AllComplaints /> },
          { path: "task-assignment", element: <AdminTaskAssignment /> },
        ],
      },
      {path:"mycomplaints", element: <MyComplaints />},
      {path:"workerdashboard", element: <WorkerDashboard />}// Add profile edit route
      // {path:"user-dashboard", element: <UserDashboard />}, // Add user dashboard route
    ],
  },
  
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);