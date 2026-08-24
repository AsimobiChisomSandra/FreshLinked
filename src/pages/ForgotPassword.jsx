import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { forgotPassword } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await forgotPassword({ email });
      setMessage(`${res.data.message} Your reset code is ${res.data.code}.`);
      setCode(res.data.code);
      navigate("/reset-password", {
        state: {
          email: res.data.email,
          code: res.data.code,
          successMessage: res.data.message,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send your reset code right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-md mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold text-brand-dark mb-2">Forgot password</h1>
        <p className="text-sm text-gray-600 mb-6">
          Enter your email to receive a one-time reset code.
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
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-brand-green"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-green hover:bg-brand-accent transition text-white font-semibold py-3 rounded-full disabled:opacity-60"
          >
            {loading ? "Sending code..." : "Send reset code"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Remembered your password?{" "}
          <Link to="/login" className="text-brand-green font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
