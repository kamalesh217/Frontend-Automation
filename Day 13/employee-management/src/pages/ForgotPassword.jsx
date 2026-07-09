import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";

import { resetPassword } from "../firebase/auth";

import "../styles/login.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleReset = async () => {
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      await resetPassword(email);

      toast.success(
        "Password reset link has been sent to your email."
      );
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="login-page">

      <div className="login-left">

        <h1>Forgot Password?</h1>

        <p>
          Enter your registered email address and we'll send
          you a password reset link.
        </p>

      </div>

      <div className="login-right">

        <div className="login-card">

          <h2>Reset Password</h2>

          <input
            type="email"
            placeholder="Enter Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            className="login-btn"
            onClick={handleReset}
          >
            <FaEnvelope />
            Send Reset Link
          </button>

          <p
            className="register-link"
            style={{ marginTop: "20px" }}
          >
            <Link to="/">
              <FaArrowLeft />
              Back to Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;