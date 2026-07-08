import React, { useState } from "react";
import "./App.css";

function EmployeeManagement() {
  const [employees, setEmployees] = useState([
    {
      id: 1001,
      name: "John Smith",
      department: "HR",
      designation: "HR Manager",
      salary: 45000,
      status: "Active",
    },
    {
      id: 1002,
      name: "Sarah Johnson",
      department: "IT",
      designation: "Software Engineer",
      salary: 65000,
      status: "Active",
    },
    {
      id: 1003,
      name: "David Wilson",
      department: "Finance",
      designation: "Accountant",
      salary: 52000,
      status: "Inactive",
    },
  ]);

  const [form, setForm] = useState({
    id: "",
    name: "",
    department: "",
    designation: "",
    salary: "",
    status: "Active",
  });

  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const addEmployee = () => {
    if (
      !form.id ||
      !form.name ||
      !form.department ||
      !form.designation ||
      !form.salary
    ) {
      alert("Fill all fields");
      return;
    }

    setEmployees([...employees, form]);

    setForm({
      id: "",
      name: "",
      department: "",
      designation: "",
      salary: "",
      status: "Active",
    });
  };

  const editEmployee = (emp) => {
    setForm(emp);
    setEditing(true);
  };

  const updateEmployee = () => {
    setEmployees(
      employees.map((emp) => (emp.id === form.id ? form : emp))
    );

    setEditing(false);

    setForm({
      id: "",
      name: "",
      department: "",
      designation: "",
      salary: "",
      status: "Active",
    });
  };

  const deleteEmployee = (id) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
  };

  const filteredEmployees = employees.filter((emp) => {
    return (
      (filter === "All" || emp.department === filter) &&
      emp.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="container">

      <h1>Employee Management System</h1>

      <div className="dashboard">

        <div className="card">
          <h2>{employees.length}</h2>
          <p>Total Employees</p>
        </div>

        <div className="card">
          <h2>
            {employees.filter((e) => e.status === "Active").length}
          </h2>
          <p>Active</p>
        </div>

        <div className="card">
          <h2>
            {employees.filter((e) => e.status === "Inactive").length}
          </h2>
          <p>Inactive</p>
        </div>

      </div>

      <div className="form">

        <input
          type="number"
          name="id"
          placeholder="Employee ID"
          value={form.id}
          onChange={handleChange}
          disabled={editing}
        />

        <input
          type="text"
          name="name"
          placeholder="Employee Name"
          value={form.name}
          onChange={handleChange}
        />

        <select
          name="department"
          value={form.department}
          onChange={handleChange}
        >
          <option value="">Department</option>
          <option>HR</option>
          <option>IT</option>
          <option>Finance</option>
          <option>Marketing</option>
        </select>

        <input
          type="text"
          name="designation"
          placeholder="Designation"
          value={form.designation}
          onChange={handleChange}
        />

        <input
          type="number"
          name="salary"
          placeholder="Salary"
          value={form.salary}
          onChange={handleChange}
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option>Active</option>
          <option>Inactive</option>
        </select>

        {editing ? (
          <button onClick={updateEmployee}>Update Employee</button>
        ) : (
          <button onClick={addEmployee}>Add Employee</button>
        )}

      </div>

      <div className="toolbar">

        <input
          placeholder="Search Employee..."
          onChange={(e) => setSearch(e.target.value)}
        />

        <select onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          <option>HR</option>
          <option>IT</option>
          <option>Finance</option>
          <option>Marketing</option>
        </select>

      </div>

      <table>

        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Salary</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {filteredEmployees.map((emp) => (

            <tr key={emp.id}>

              <td>{emp.id}</td>
              <td>{emp.name}</td>
              <td>{emp.department}</td>
              <td>{emp.designation}</td>
              <td>₹{emp.salary}</td>

              <td>
                <span
                  className={
                    emp.status === "Active"
                      ? "active"
                      : "inactive"
                  }
                >
                  {emp.status}
                </span>
              </td>

              <td>

                <button
                  className="edit"
                  onClick={() => editEmployee(emp)}
                >
                  Edit
                </button>

                <button
                  className="delete"
                  onClick={() => deleteEmployee(emp.id)}
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default EmployeeManagement;