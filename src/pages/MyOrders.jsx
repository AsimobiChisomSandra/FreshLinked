import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getOrders } from "../services/api";
import { Link } from "react-router-dom";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getOrders();
        setOrders(res.data || []);
      } catch (err) {
        console.error('Failed to fetch orders', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">My Orders</h1>

        {loading ? (
          <p className="text-sm text-gray-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-gray-600">You have no orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id || order.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order {order.reference || (order._id || order.id)}</p>
                    <p className="text-sm text-gray-600">Date: {new Date(order.createdAt).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Items: {order.items?.length || 0}</p>
                    <p className="text-sm text-gray-600">Total: ₦{order.totalAmount ?? order.subtotal ?? 0}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-sm bg-gray-100">{order.status}</span>
                    <Link to={`/orders/${order._id || order.id}`} className="px-3 py-1 bg-brand-green text-white rounded-full text-sm">View Order</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
