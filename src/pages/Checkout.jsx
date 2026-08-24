import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createOrder } from "../services/api";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState({
    deliveryMethod: "pickup",
    pickupLocation: "Agbor Fresh Produce Hub",
    phone: user?.phone || "",
    address: user?.location || "",
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const total = subtotal;

  if (items.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-brand-dark">Your cart is empty</h1>
          <p className="text-gray-600 mt-3">Add items before checking out.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setProcessing(true);

    try {
      const orderPayload = {
        items: items.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        totalAmount: total,
        deliveryMethod: form.deliveryMethod,
        pickupLocation: form.pickupLocation,
        contactPhone: form.phone,
        deliveryAddress: form.deliveryMethod === "pickup" ? form.pickupLocation : form.address,
      };

      const response = await createOrder(orderPayload);
      const orderId = response?.data?._id || response?.data?.id || `FL-${Date.now()}`;

      clearCart();
      navigate(`/order-confirmation/${orderId}`);
    } catch {
      setError("Unable to complete your order right now. Please check your connection and try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-brand-dark mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1.4fr_0.9fr] gap-8">
          <div className="space-y-6">
            <section className="bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="font-semibold text-brand-dark mb-4">Buyer details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Full name</label>
                  <input value={user?.name || ""} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="font-semibold text-brand-dark mb-4">Delivery option</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="radio" name="deliveryMethod" value="pickup" checked={form.deliveryMethod === "pickup"} onChange={handleChange} />
                  <span>Pickup from the farm or designated hub</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="deliveryMethod" value="delivery" checked={form.deliveryMethod === "delivery"} onChange={handleChange} />
                  <span>Home delivery</span>
                </label>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-700 mb-1">Pickup / delivery location</label>
                <input
                  name={form.deliveryMethod === "pickup" ? "pickupLocation" : "address"}
                  value={form.deliveryMethod === "pickup" ? form.pickupLocation : form.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="font-semibold text-brand-dark mb-4">Products</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item._id} className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 last:border-none last:pb-0">
                    <div>
                      <p className="font-medium text-brand-dark">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-brand-accent">₦{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="bg-brand-light-green rounded-2xl p-6 h-fit">
            <h2 className="text-lg font-semibold text-brand-dark">Order summary</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <div className="flex justify-between"><span>Subtotal</span><span>₦{total.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>Calculated</span></div>
              <div className="flex justify-between"><span>Fee</span><span>₦0</span></div>
            </div>
            <div className="mt-6 border-t border-gray-200 pt-4 flex justify-between font-semibold text-brand-dark">
              <span>Total</span>
              <span>₦{total.toLocaleString()}</span>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="mt-6 w-full bg-brand-green text-white font-semibold py-3 rounded-full disabled:opacity-60"
            >
              {processing ? "Processing payment..." : "Pay securely"}
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
}
