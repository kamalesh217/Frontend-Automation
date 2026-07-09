import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { addEmployee } from "../services/firestoreService";

import "../styles/form.css";

function AddEmployee() {
  const navigate = useNavigate();

  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    salary: "",
    joiningDate: "",
    status: "Active",
  });

  const handleChange = (e) => {
    setEmployee({
      ...employee,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !employee.name ||
      !employee.email ||
      !employee.phone ||
      !employee.department ||
      !employee.designation ||
      !employee.salary ||
      !employee.joiningDate
    ) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await addEmployee(employee);

      toast.success("Employee Added Successfully");

      navigate("/employees");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="form-page">

      <div className="form-card">

        <h1>Add Employee</h1>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={employee.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={employee.email}
            onChange={handleChange}
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={employee.phone}
            onChange={handleChange}
          />

          <input
            type="text"
            name="department"
            placeholder="Department"
            value={employee.department}
            onChange={handleChange}
          />

          <input
            type="text"
            name="designation"
            placeholder="Designation"
            value={employee.designation}
            onChange={handleChange}
          />

          <input
            type="number"
            name="salary"
            placeholder="Salary"
            value={employee.salary}
            onChange={handleChange}
          />

          <input
            type="date"
            name="joiningDate"
            value={employee.joiningDate}
            onChange={handleChange}
          />

          <select
            name="status"
            value={employee.status}
            onChange={handleChange}
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <button type="submit">
            Save Employee
          </button>

        </form>

      </div>

    </div>
  );
}

export default AddEmployee;