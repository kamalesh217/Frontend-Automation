import DashboardCard from "./DashboardCard";
import {
  FaUsers,
  FaBuilding,
  FaCalendarCheck,
  FaUserClock,
} from "react-icons/fa";

function DashboardStats() {
  const stats = [
    {
      title: "Total Employees",
      value: 120,
      icon: <FaUsers />,
      color: "#2563eb",
    },
    {
      title: "Departments",
      value: 8,
      icon: <FaBuilding />,
      color: "#10b981",
    },
    {
      title: "Attendance",
      value: "96%",
      icon: <FaCalendarCheck />,
      color: "#f59e0b",
    },
    {
      title: "On Leave",
      value: 12,
      icon: <FaUserClock />,
      color: "#ef4444",
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((item, index) => (
        <DashboardCard key={index} {...item} />
      ))}
    </div>
  );
}

export default DashboardStats;