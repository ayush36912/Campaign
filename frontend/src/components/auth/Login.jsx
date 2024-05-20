import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState([]);
  let errorMessage = '';
  let err =  {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    errorMessage = validateField(name, value);
    err = {...err,  [name]: errorMessage};
    setErrors(err);
  };

  const validateField = (name, value) => {
    // letreturn '';
    switch (name) {
      case "email":
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (value.trim() === "") {
          return "Email is requried";
        } else if (!emailRegex.test(value)) {
          return "Please enter a valid email address";
        }
        break;
      case "password":
        const passwordRegex =
          /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{5,16}$/;
        if (value.trim() === "") {
          return "Password is requried";
        } else if (value.trim().length < 5) {
          return "Password must be at least 5 characters long";
        } else if (!passwordRegex.test(value)) {
          return "Password should contain minimum one uppercase letter, one lowercase letter, one number and one special character.";
        }
        break;
      default:
        break;
    }
    //console.log(errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formIsValid = true;
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        errorMessage = validateField(key, formData[key]);
        err = {...err,  [key]: errorMessage};
      }
      setErrors(err);
    }
    if (formIsValid) {
      try {
        await login(formData.email, formData.password);
        navigate("/");
      } catch (err) {
        console.error("Error logging in user:", err);
        if (err.response && err.response.data && err.response.data.errors) {
          err.response.data.errors.forEach((error) => {
            toast.error(error.msg);
          });
        } else {
          console.log("An error occurred while logging in.");
        }
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header text-white">Login</div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email && "is-invalid"}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    maxLength={30}
                    required
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    className={`form-control ${
                      errors.password && "is-invalid"
                    }`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    maxLength={15}
                    required
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>
                <button type="submit" className="btn btn-orange mt-2">
                  Login
                </button>
              </form>
              <div className="forgot-password">
                <Link to={`/forgotPassword`}>Forgot Password?</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
