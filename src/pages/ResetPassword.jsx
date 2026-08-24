import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resetPassword } from "../services/api";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = location.state?.email || "";
  const initialCode = location.state?.code || "";

  const [form, setForm] = useState({
    email: initialEmail,
    code: initialCode,
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState(location.state?.successMessage || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (form.password.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword({
        email: form.email,
        code: form.code,
        password: form.password,
      });

      setMessage(res.data.message);
      setTimeout(() => {
        navigate("/login", {
          state: { successMessage: "Password reset successful. Please log in with your new password." },
        });
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-md mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold text-brand-dark mb-2">Reset password</h1>
        <p className="text-sm text-gray-600 mb-6">
          Enter the code we sent to your email and choose a new password.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        {message && (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-brand-green"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Reset code</label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-brand-green"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">New password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-brand-green"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Confirm new password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-brand-green"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-green hover:bg-brand-accent transition text-white font-semibold py-3 rounded-full disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Need a new code?{" "}
          <Link to="/forgot-password" className="text-brand-green font-medium">
            Send another
          </Link>
        </p>
      </div>
    </div>
  );
}
