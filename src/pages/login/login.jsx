import { useState } from "react";
import "./login.css";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let newErrors = {};

    if (form.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      localStorage.setItem("user", JSON.stringify(form));
      alert("Registration successful 🎉");
      setForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    }
  };

  return (
    <div className="register-container">
      <div className="overlay"></div>

      <form className="register-card" onSubmit={handleSubmit}>
        <h1 className="title">Welcome Back</h1>

        <div className="input-group">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />
          {errors.username && <span>{errors.username}</span>}
        </div>

        <div className="input-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <span>{errors.email}</span>}
        </div>

        <div className="input-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          {errors.password && <span>{errors.password}</span>}
        </div>

        <button type="submit" className="register-btn">
          Login
        </button>

        <p className="login-link">{" "}
          <Link to="/register" className="login-btn">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}