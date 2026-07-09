import { Link } from "react-router-dom";
import {
  FaEnvelope,
  FaPhone,
  FaBuilding,
} from "react-icons/fa";

function EmployeeCard({ employee }) {
  return (
    <div className="employee-card">

      <img src={employee.image} alt={employee.firstName} />

      <h2>
        {employee.firstName} {employee.lastName}
      </h2>

      <p className="designation">
        {employee.company.title}
      </p>

      <p>
        <FaEnvelope />
        {employee.email}
      </p>

      <p>
        <FaPhone />
        {employee.phone}
      </p>

      <p>
        <FaBuilding />
        {employee.company.department}
      </p>

      <Link
        to={`/employee/${employee.id}`}
        className="details-btn"
      >
        View Details
      </Link>

    </div>
  );
}

export default EmployeeCard;