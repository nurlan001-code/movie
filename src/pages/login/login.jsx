import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import "./login.css";

export default function LoginPage() {
  const [form, setForm]     = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading]       = useState(false);
  const [firebaseError, setFirebaseError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFirebaseError("");
  };

  const validate = () => {
    const e = {};
    if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = "Invalid email format";
    if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setFirebaseError("");

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/"); // после входа → на главную
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setFirebaseError("Неверный email или пароль");
          break;
        case "auth/too-many-requests":
          setFirebaseError("Слишком много попыток. Попробуйте позже.");
          break;
        default:
          setFirebaseError("Ошибка входа. Попробуйте снова.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="overlay" />
      <form className="register-card" onSubmit={handleSubmit}>
        <h1 className="title">Welcome Back</h1>

        {firebaseError && (
          <div className="firebase-error">{firebaseError}</div>
        )}

        <div className="input-group">
          <input type="email" name="email" placeholder="Email"
            value={form.email} onChange={handleChange} />
          {errors.email && <span>{errors.email}</span>}
        </div>

        <div className="input-group">
          <input type="password" name="password" placeholder="Password"
            value={form.password} onChange={handleChange} />
          {errors.password && <span>{errors.password}</span>}
        </div>

        <button type="submit" className="register-btn" disabled={loading}>
          {loading ? "Входим..." : "Login"}
        </button>

        <p className="login-link">
          <Link to="/register" className="login-btn">Register</Link>
        </p>
      </form>
    </div>
  );
}