import {
  faClipboardList,
  faSpinner,
  faCheckCircle,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";

export const mockStats = [
  { title: "Total Complaints", count: 125, icon: faClipboardList },
  { title: "In Progress", count: 12, icon: faSpinner },
  { title: "Resolved", count: 98, icon: faCheckCircle },
  { title: "New / Unassigned", count: 15, icon: faExclamationCircle },
];

export const mockComplaints = [
  {
    id: "C-20250801",
    status: "In Progress",
    priority: "High",
    title: "Elevator not working in B-Wing",
    description:
      "The main elevator in B-Wing has been stuck since this morning. Residents on higher floors are facing major issues.",
    date: "Aug 1, 2025",
    location: "B-Wing, 4th Floor",
    assignedTo: "Rajesh Kumar",
  },
  {
    id: "C-20250728",
    status: "Resolved",
    priority: "Medium",
    title: "Water leakage in basement parking",
    description:
      "There is a significant water leakage near parking spot #54. It's creating a puddle and is a safety hazard.",
    date: "Jul 28, 2025",
    location: "Basement Parking",
    assignedTo: "Suresh Patil",
  },
  {
    id: "C-20250803",
    status: "New",
    priority: "Low",
    title: "Garden lights near playground are off",
    description:
      "The lights in the children's play area are not turning on after 7 PM.",
    date: "Aug 3, 2025",
    location: "Children's Garden",
    assignedTo: "Unassigned",
  },
];
