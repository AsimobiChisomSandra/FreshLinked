import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { registerUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

const produceOptions = ["Vegetables", "Fruits", "Grains", "Tubers"];

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
    phone: "",
    location: "",
    farmName: "",
    primaryProduce: "",
    shoppingInterest: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await registerUser(formData);
      const { token, user } = res.data;
      login({ token, user });
      const redirectTarget = new URLSearchParams(location.search).get("redirect");
      const destination = user?.role === "farmer" || user?.role === "seller" ? "/farmer-dashboard" : "/marketplace";
      navigate(redirectTarget ? decodeURIComponent(redirectTarget) : destination, { replace: true });
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response) {
        // Backend responded with an error (e.g. validation, duplicate email)
        setError(err.response.data?.message || "Registration failed. Please try again.");
      } else if (err.request) {
        // Request was sent but no response came back — backend is likely not running
        setError("Can't reach the server. Is your backend running on port 5000?");
      } else {
        setError(err.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-md mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold text-brand-dark mb-1">
          {formData.role === "seller" || formData.role === "farmer" ? "Start Selling on FreshLink" : "Create Your Buyer Account"}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {formData.role === "seller" || formData.role === "farmer"
            ? "List your produce and reach verified buyers directly."
            : "Get access to verified, safety-transparent farm produce."}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "buyer" })}
              className={`flex-1 py-2 rounded-full text-sm font-medium border transition ${
                formData.role === "buyer"
                  ? "bg-brand-green text-white border-brand-green"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              🛒 I'm a Buyer
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "seller" })}
              className={`flex-1 py-2 rounded-full text-sm font-medium border transition ${
                formData.role === "seller" || formData.role === "farmer"
                  ? "bg-brand-green text-white border-brand-green"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              🌱 I'm a Farmer
            </button>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-brand-green"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-brand-green"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-brand-green"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-brand-green"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              {formData.role === "seller" || formData.role === "farmer" ? "Farm Location" : "Delivery Location"}
            </label>
            <input
              type="text"
              name="location"
              placeholder="e.g. Agbor, Delta State"
              value={formData.location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-brand-green"
            />
          </div>

          {formData.role === "seller" || formData.role === "farmer" ? (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">Farm / Business Name</label>
                <input
                  type="text"
                  name="farmName"
                  placeholder="e.g. Musa's Farm Produce"
                  value={formData.farmName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">What do you mainly grow?</label>
                <select
                  name="primaryProduce"
                  value={formData.primaryProduce}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-brand-green bg-white"
                >
                  <option value="">Select an option</option>
                  {produceOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  <option value="Mixed">A mix of produce</option>
                </select>
              </div>
            </>
          ) : (
            <div>
              <label className="text-sm font-medium text-gray-700">What are you mostly shopping for?</label>
              <select
                name="shoppingInterest"
                value={formData.shoppingInterest}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-brand-green bg-white"
              >
                <option value="">Select an option</option>
                {produceOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                <option value="A bit of everything">A bit of everything</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-green hover:bg-brand-accent transition text-white font-semibold py-3 rounded-full disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-green font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
