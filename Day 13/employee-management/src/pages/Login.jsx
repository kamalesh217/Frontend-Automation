import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaUserTie,
} from "react-icons/fa";
import { toast } from "react-toastify";

import {
  loginUser,
  googleLogin,
} from "../firebase/auth";

import "../styles/login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await loginUser(email, password);

      toast.success("Login Successful");

      navigate("/dashboard");
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-credential":
          toast.error("Invalid email or password");
          break;

        case "auth/user-not-found":
          toast.error("User not found");
          break;

        case "auth/wrong-password":
          toast.error("Wrong password");
          break;

        default:
          toast.error(error.message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();

      toast.success("Google Login Successful");

      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="login-page">

      <div className="login-left">

        <div className="brand">

          <FaUserTie className="brand-icon" />

          <h1>EmployeePro</h1>

        </div>

        <h2>Manage Your Workforce Efficiently</h2>

        <p>
          EmployeePro helps HR teams manage
          employees, attendance, departments
          and payroll from one dashboard.
        </p>

      </div>

      <div className="login-right">

        <div className="login-card">

          <h1>Welcome Back 👋</h1>

          <p>Login to your account</p>

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <div className="password-box">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
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
                setShowPassword(
                  !showPassword
                )
              }
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

          <div className="login-options">

            <label>

              <input type="checkbox" />

              Remember Me

            </label>

            <Link to="/forgot-password">

              Forgot Password?

            </Link>

          </div>

          <button
            className="login-btn"
            onClick={handleLogin}
          >
            Login
          </button>

          <div className="divider">

            <span>OR</span>

          </div>

          <button
            className="google-btn"
            onClick={handleGoogleLogin}
          >

            <FaGoogle />

            Continue with Google

          </button>

          <p className="register-link">

            Don't have an account?

            <Link to="/register">

              Create Account

            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;