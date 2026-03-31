import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../firebase";
import "./Register.css";

export default function RegisterPage() {
  const [form, setForm]     = useState({
    username: "", email: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFirebaseError("");
  };

  const validate = () => {
    const e = {};
    if (form.username.length < 3)
      e.username = "Username must be at least 3 characters";
    if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = "Invalid email format";
    if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setFirebaseError("");

    try {
      // Создаём пользователя
      const { user } = await createUserWithEmailAndPassword(
        auth, form.email, form.password
      );
      // Сохраняем username в профиле
      await updateProfile(user, { displayName: form.username });

      navigate("/"); // после регистрации → на главную
    } catch (err) {
      switch (err.code) {
        case "auth/email-already-in-use":
          setFirebaseError("Этот email уже зарегистрирован");
          break;
        case "auth/invalid-email":
          setFirebaseError("Неверный формат email");
          break;
        case "auth/weak-password":
          setFirebaseError("Пароль слишком простой");
          break;
        default:
          setFirebaseError("Ошибка регистрации. Попробуйте снова.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="overlay" />
      <form className="register-card" onSubmit={handleSubmit}>
        <h1 className="title">Create</h1>

        {firebaseError && (
          <div className="firebase-error">{firebaseError}</div>
        )}

        <div className="input-group">
          <input type="text" name="username" placeholder="Username"
            value={form.username} onChange={handleChange} />
          {errors.username && <span>{errors.username}</span>}
        </div>

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

        <div className="input-group">
          <input type="password" name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword} onChange={handleChange} />
          {errors.confirmPassword && <span>{errors.confirmPassword}</span>}
        </div>

        <button type="submit" className="register-btn" disabled={loading}>
          {loading ? "Создаём аккаунт..." : "Register"}
        </button>

        <p className="login-link">
          Already have an account?{" "}
          <Link to="/login" className="login-btn">Login</Link>
        </p>
      </form>
    </div>
  );
}