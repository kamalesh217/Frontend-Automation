import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

const employeeCollection = collection(db, "employees");

// Add Employee
export const addEmployee = async (employee) => {
  return await addDoc(employeeCollection, employee);
};

// Get All Employees
export const getEmployees = async () => {
  const snapshot = await getDocs(employeeCollection);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Get One Employee
export const getEmployee = async (id) => {
  const employeeRef = doc(db, "employees", id);

  const employee = await getDoc(employeeRef);

  return {
    id: employee.id,
    ...employee.data(),
  };
};

// Update Employee
export const updateEmployee = async (id, employee) => {
  const employeeRef = doc(db, "employees", id);

  return await updateDoc(employeeRef, employee);
};

// Delete Employee
export const deleteEmployee = async (id) => {
  const employeeRef = doc(db, "employees", id);

  return await deleteDoc(employeeRef);
};