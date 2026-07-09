import DashboardStats from "../components/DashboardStats";
import QuickActions from "../components/QuickActions";
import EmployeeChart from "../components/EmployeeChart";
import DepartmentChart from "../components/DepartmentChart";

import "../styles/dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">

      <div className="dashboard-header">

        <h1>Welcome Back 👋</h1>

        <p>
          Manage your employees from one professional dashboard.
        </p>

      </div>

      <DashboardStats />

      <QuickActions />

      <div className="charts">

        <EmployeeChart />

        <DepartmentChart />

      </div>

    </div>
  );
}

export default Dashboard;