import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUserTie,
  FaEye,
  FaEyeSlash,
  FaGoogle,
} from "react-icons/fa";
import { toast } from "react-toastify";

import {
  registerUser,
  googleLogin,
} from "../firebase/auth";

import "../styles/register.css";

function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [agree, setAgree] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleRegister = async () => {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      toast.error("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      toast.error(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!agree) {
      toast.error(
        "Please accept the Terms & Conditions."
      );
      return;
    }

    try {
      await registerUser(
        firstName,
        lastName,
        email,
        phone,
        password
      );

      toast.success("Account Created Successfully!");

      navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await googleLogin();

      toast.success("Google Sign In Successful!");

      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="register-page">

      <div className="register-left">

        <div className="brand">
          <FaUserTie className="brand-icon" />
          <h1>EmployeePro</h1>
        </div>

        <h2>Join EmployeePro Today 🚀</h2>

        <p>
          Create your HR account and manage employees,
          attendance, departments and payroll from one
          secure dashboard.
        </p>

      </div>

      <div className="register-right">

        <div className="register-card">

          <h1>Create Account</h1>

          <p>Create your HR Management account</p>

          <div className="row">

            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) =>
                setFirstName(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) =>
                setLastName(e.target.value)
              }
            />

          </div>

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
          />

          <div className="password-box">

            <input
              type={
                showPassword ? "text" : "password"
              }
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

          <div className="password-box">

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
            >
              {showConfirmPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

          <label className="terms">

            <input
              type="checkbox"
              checked={agree}
              onChange={(e) =>
                setAgree(e.target.checked)
              }
            />

            I agree to the Terms & Conditions

          </label>

          <button
            className="register-btn"
            onClick={handleRegister}
          >
            Create Account
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <button
            className="google-btn"
            onClick={handleGoogleSignup}
          >
            <FaGoogle />
            Continue with Google
          </button>

          <p className="login-link">

            Already have an account?

            <Link to="/">
              Login
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;