import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data || res);
      } catch (err) {
        console.error('Failed to fetch order', err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading order...</div>;
  if (!order) return <div><Navbar /><div className="max-w-4xl mx-auto px-6 py-10">Order not found.</div></div>;

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-brand-dark mb-4">Order {order.reference || order._id}</h1>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="font-medium">Order Information</h2>
          <p className="text-sm text-gray-600">Placed: {new Date(order.createdAt).toLocaleString()}</p>
          <p className="text-sm text-gray-600">Payment: {order.paymentStatus}</p>
          <p className="text-sm text-gray-600">Status: {order.status}</p>

          <h3 className="mt-4 font-medium">Products</h3>
          <ul className="mt-2 space-y-2">
            {order.items.map((it, i) => (
              <li key={i} className="flex justify-between">
                <div>
                  <p className="font-medium">{it.productName || it.productId}</p>
                  <p className="text-sm text-gray-600">Qty: {it.qty}</p>
                </div>
                <div className="text-right">
                  <p>₦{it.priceAtOrder}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 text-right">
            <p className="text-sm text-gray-600">Subtotal: ₦{order.subtotal ?? 0}</p>
            <p className="font-medium">Total: ₦{order.totalAmount ?? 0}</p>
          </div>

          <h3 className="mt-6 font-medium">Fulfillment</h3>
          <p className="text-sm text-gray-600">Method: {order.fulfillmentMethod}</p>
          {order.fulfillmentMethod === 'pickup' ? (
            <p className="text-sm text-gray-600">Pickup location: {order.pickupLocation || 'Pickup from farm'}</p>
          ) : (
            <p className="text-sm text-gray-600">Delivery address: {order.deliveryAddress}</p>
          )}
        </div>
      </div>
    </div>
  );
}
