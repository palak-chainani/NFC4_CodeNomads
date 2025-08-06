import React from "react";
import { Outlet } from "react-router-dom"; // Import Outlet

import Header from "../components/Header";
import "../Dashboard.css";

const DashboardLayout = () => {
  return (
    <div className="dashboard-container">
      
      <div className="main-content">
        <main className="dashboard-main">
          {/* Child routes (DashboardHome, MyComplaints, etc.) will render here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
