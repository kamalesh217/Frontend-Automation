import { useParams } from "react-router-dom";

function EmployeeDetails() {
  const { id } = useParams();

  return (
    <div className="page">
      <h1>Employee Details</h1>
      <p>Employee ID : {id}</p>
    </div>
  );
}

export default EmployeeDetails;