// src/components/ComplaintCard.jsx

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCalendar,
  faHourglassStart,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";

const ComplaintCard = ({ complaint }) => {
  if (!complaint) {
    return (
      <div className="text-red-600 font-semibold p-4 border border-red-300 rounded">
        Error: Complaint data is missing.
      </div>
    );
  }

  const {
    title,
    description,
    status,
    priority,
    created_at,
    resolved_at,
    reporter,
  } = complaint;



  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "Not Available";

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 border hover:shadow-lg transition-shadow duration-200">




      {/* Header: Title and Status */}
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xl font-semibold text-[#0A400C]">{title}</h2>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(
              status
            )}`}
          >
            {status?.replace("_", " ") || "Unknown"}
          </span>

        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm mb-4 line-clamp-3">{description}</p>

      {/* Meta Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faUser} className="text-gray-500" />
          <span>Reporter: <strong>{reporter?.username || "Unknown"}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faCalendar} className="text-gray-500" />
          <span>Created: <strong>{formatDate(created_at)}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faHourglassStart} className="text-gray-500" />
          <span>Resolved: <strong>{formatDate(resolved_at)}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faExclamationCircle} className="text-gray-500" />
          <span>Priority: <strong>{priority || "Not Set"}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;
