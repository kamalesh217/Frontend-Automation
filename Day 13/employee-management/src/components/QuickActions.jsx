import {
  FaUserPlus,
  FaUsers,
  FaCalendarCheck,
  FaChartBar,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

function QuickActions() {

  const navigate = useNavigate();

  return (

    <div className="quick-actions">

      <button onClick={() => navigate("/add")}>
        <FaUserPlus />
        Add Employee
      </button>

      <button onClick={() => navigate("/employees")}>
        <FaUsers />
        Employees
      </button>

      <button>
        <FaCalendarCheck />
        Attendance
      </button>

      <button>
        <FaChartBar />
        Reports
      </button>

    </div>

  );
}

export default QuickActions;