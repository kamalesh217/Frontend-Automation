import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getEmployee } from "../services/firestoreService";
import "../styles/employeeDetails.css";

function EmployeeDetails() {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployee();
  }, []);

  const loadEmployee = async () => {
    try {
      const data = await getEmployee(id);

      console.log(data);

      setEmployee(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        Loading Employee...
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="loading">
        Employee Not Found
      </div>
    );
  }

  return (
    <div className="details-container">

      <div className="profile-card">

        <div className="profile-avatar">
          👤
        </div>

        <h1>{employee.name}</h1>

        <p>{employee.designation}</p>

        <span
          className={
            employee.status === "Active"
              ? "status active"
              : "status inactive"
          }
        >
          {employee.status}
        </span>

      </div>

      <div className="info-card">

        <h2>Employee Information</h2>

        <div className="info-grid">

          <div>
            <strong>Email</strong>
            <p>{employee.email}</p>
          </div>

          <div>
            <strong>Phone</strong>
            <p>{employee.phone}</p>
          </div>

          <div>
            <strong>Department</strong>
            <p>{employee.department}</p>
          </div>

          <div>
            <strong>Designation</strong>
            <p>{employee.designation}</p>
          </div>

          <div>
            <strong>Salary</strong>
            <p>₹ {employee.salary}</p>
          </div>

          <div>
            <strong>Joining Date</strong>
            <p>{employee.joiningDate}</p>
          </div>

        </div>

        <Link
          to="/employees"
          className="back-btn"
        >
          ← Back to Employees
        </Link>

      </div>

    </div>
  );
}

export default EmployeeDetails;