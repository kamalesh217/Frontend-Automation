import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import "../styles/employeeDetails.css";

function EmployeeDetails() {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    fetchEmployee();
  }, []);

  const fetchEmployee = async () => {
    try {
      const response = await API.get(`/users/${id}`);
      setEmployee(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!employee) {
    return (
      <div className="loading">
        Loading Employee...
      </div>
    );
  }

  return (
    <div className="details-container">

      <div className="profile-card">

        <img
          src={employee.image}
          alt={employee.firstName}
          className="profile-image"
        />

        <h1>
          {employee.firstName} {employee.lastName}
        </h1>

        <p>{employee.company.title}</p>

      </div>

      <div className="info-card">

        <h2>Employee Information</h2>

        <div className="info-grid">

          <div>
            <strong>Age</strong>
            <p>{employee.age}</p>
          </div>

          <div>
            <strong>Gender</strong>
            <p>{employee.gender}</p>
          </div>

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
            <p>{employee.company.department}</p>
          </div>

          <div>
            <strong>Company</strong>
            <p>{employee.company.name}</p>
          </div>

          <div>
            <strong>Blood Group</strong>
            <p>{employee.bloodGroup}</p>
          </div>

          <div>
            <strong>University</strong>
            <p>{employee.university}</p>
          </div>

          <div>
            <strong>Address</strong>
            <p>
              {employee.address.address},
              {" "}
              {employee.address.city}
            </p>
          </div>

        </div>

        <Link to="/employees" className="back-btn">
          ← Back to Employees
        </Link>

      </div>

    </div>
  );
}

export default EmployeeDetails;