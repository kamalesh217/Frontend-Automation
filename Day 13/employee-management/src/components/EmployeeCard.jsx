import { Link } from "react-router-dom";
import {
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaBriefcase,
  FaUserCircle,
  FaEye,
  FaPen,
  FaTrash,
} from "react-icons/fa";

function EmployeeCard({ employee }) {
  return (
    <div className="emp-card">

      <div className="emp-card-header">

        <div className="emp-avatar">
          {employee.image ? (
            <img src={employee.image} alt={employee.name} />
          ) : (
            <FaUserCircle />
          )}
        </div>

        <span
          className={
            employee.source === "company"
              ? "company-badge"
              : "api-badge"
          }
        >
          {employee.source === "company"
            ? "Company"
            : "External API"}
        </span>

      </div>

      <h2>{employee.name}</h2>

      <p className="emp-designation">
        <FaBriefcase />
        <span>{employee.designation}</span>
      </p>

      <p>
        <FaEnvelope />
        <span>{employee.email}</span>
      </p>

      <p>
        <FaPhone />
        <span>{employee.phone}</span>
      </p>

      <p>
        <FaBuilding />
        <span>{employee.department}</span>
      </p>

      <div className="emp-buttons">

        <Link
          to={`/employee/${employee.id}`}
          className="view-btn"
        >
          <FaEye />
          View
        </Link>

        {employee.source === "company" && (
          <>
            <Link
              to={`/edit/${employee.id}`}
              className="edit-btn"
            >
              <FaPen />
              Edit
            </Link>

            <button className="delete-btn">
              <FaTrash />
              Delete
            </button>
          </>
        )}

      </div>

    </div>
  );
}

export default EmployeeCard;