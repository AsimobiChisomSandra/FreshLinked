import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getOrders, updateOrderStatus } from "../services/api";

export default function FarmerOrders() {
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

  const handleUpdate = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Orders</h1>

        {loading ? (
          <p className="text-sm text-gray-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-gray-600">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id || order.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order {order._id || order.id}</p>
                    <p className="text-sm text-gray-600">Buyer: {order.buyerId?.name || order.buyerId?.email || '-'}</p>
                    <p className="text-sm text-gray-600">Items: {order.items?.length || 0}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-sm bg-gray-100">{order.status}</span>
                    <div className="flex gap-2">
                      {order.status !== 'confirmed' && (
                        <button onClick={() => handleUpdate(order._id || order.id, 'confirmed')} className="px-3 py-1 bg-brand-green text-white rounded-full text-sm">Confirm</button>
                      )}
                      {order.status === 'confirmed' && (
                        <button onClick={() => handleUpdate(order._id || order.id, 'out_for_delivery')} className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm">Out for delivery</button>
                      )}
                      {order.status !== 'delivered' && (
                        <button onClick={() => handleUpdate(order._id || order.id, 'delivered')} className="px-3 py-1 bg-brand-dark text-white rounded-full text-sm">Mark delivered</button>
                      )}
                    </div>
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
