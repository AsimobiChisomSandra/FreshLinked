import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createProduct } from "../services/api";

const defaultForm = {
  name: "",
  description: "",
  category: "Vegetables",
  price: "",
  unit: "basket",
  quantity: "",
  harvestDate: "",
  location: "",
  pickupLocation: "",
  imageUrl: "",
  noRipeningAgentPledge: false,
};

export default function AddProduce() {
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
        harvestDate: new Date(form.harvestDate).toISOString(),
      };

      await createProduct(payload);
      setSuccess("Produce published successfully. It is now live in the marketplace.");
      setForm(defaultForm);
      setTimeout(() => navigate("/farmer-dashboard"), 900);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to publish produce right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-brand-green font-semibold">Add Produce</p>
            <h1 className="text-3xl font-bold text-brand-dark">Publish fresh farm produce</h1>
          </div>
          <Link to="/farmer-dashboard" className="text-sm text-brand-green font-medium">Back to dashboard</Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product name</label>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-white">
                <option>Vegetables</option>
                <option>Fruits</option>
                <option>Grains</option>
                <option>Tubers</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} required className="w-full border border-gray-300 rounded-xl px-4 py-2.5" />
          </div>

          <div className="grid md:grid-cols-4 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
              <input name="price" type="number" min="1" value={form.price} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select name="unit" value={form.unit} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-white">
                <option value="basket">basket</option>
                <option value="crate">crate</option>
                <option value="bag">bag</option>
                <option value="bunch">bunch</option>
                <option value="piece">piece</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available quantity</label>
              <input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harvest date</label>
              <input name="harvestDate" type="date" value={form.harvestDate} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-2.5" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farm / pickup location</label>
              <input name="pickupLocation" value={form.pickupLocation} onChange={handleChange} placeholder="e.g. Agbor Fresh Produce Hub" className="w-full border border-gray-300 rounded-xl px-4 py-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." className="w-full border border-gray-300 rounded-xl px-4 py-2.5" />
            </div>
          </div>

          <div className="rounded-xl border border-brand-green/30 bg-brand-light-green p-4">
            <p className="font-semibold text-brand-dark mb-2">FreshLink Produce Pledge</p>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                name="noRipeningAgentPledge"
                checked={form.noRipeningAgentPledge}
                onChange={handleChange}
                className="mt-1"
              />
              <span>
                I confirm this produce was harvested naturally and was not artificially ripened using prohibited or unsafe ripening agents.
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || !form.noRipeningAgentPledge}
              className="flex-1 bg-brand-green text-white font-semibold py-3 rounded-full disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Publish Produce"}
            </button>
            <Link to="/farmer-dashboard" className="flex-1 text-center border border-gray-300 text-gray-700 font-semibold py-3 rounded-full">
              Save draft
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
