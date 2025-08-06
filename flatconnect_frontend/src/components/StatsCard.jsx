// Create this new file
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const StatsCard = ({ title, count, icon }) => {
  return (
    <div className="stats-card">
      <div className="stats-icon-wrapper">
        <FontAwesomeIcon icon={icon} className="stats-icon" />
      </div>
      <div className="stats-info">
        <p className="stats-title">{title}</p>
        <p className="stats-count">{count}</p>
      </div>
    </div>
  );
};

export default StatsCard;
