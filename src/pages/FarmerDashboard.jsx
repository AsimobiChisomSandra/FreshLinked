import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api, { getOrders, updateOrderStatus } from "../services/api";

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products/mine");
        setProducts(res.data || []);
      } catch (err) {
        console.error("Failed to fetch farmer products", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const res = await getOrders();
        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to fetch orders", err);
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const activeProducts = products.filter((product) => product.status === "active");
  const totalInventory = activeProducts.reduce((sum, product) => sum + Number(product.quantity || 0), 0);

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-brand-green font-semibold">Farmer Dashboard</p>
            <h1 className="text-3xl font-bold text-brand-dark">Welcome back, {user?.name?.split(" ")[0] || "Farmer"}</h1>
          </div>
          <Link
            to="/farmer/add-produce"
            className="inline-flex items-center justify-center bg-brand-green text-white px-5 py-3 rounded-full font-semibold"
          >
            + Add Produce
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Active products</p>
            <p className="text-3xl font-bold text-brand-dark mt-2">{activeProducts.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Inventory available</p>
            <p className="text-3xl font-bold text-brand-dark mt-2">{totalInventory}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Trust score</p>
            <p className="text-3xl font-bold text-brand-dark mt-2">{user?.trustScore || 100}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6">
          <section className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-brand-dark">My Produce</h2>
              <Link to="/farmer/add-produce" className="text-sm text-brand-green font-medium">Manage listings</Link>
            </div>

            {loading ? (
              <p className="text-sm text-gray-500">Loading your produce...</p>
            ) : activeProducts.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center">
                <p className="text-gray-600 mb-3">No produce has been published yet.</p>
                <Link to="/farmer/add-produce" className="inline-block bg-brand-green text-white px-4 py-2 rounded-full font-medium">
                  Publish your first product
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeProducts.map((product) => (
                  <div key={product._id} className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="font-semibold text-brand-dark">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.quantity} {product.unit || "units"} • ₦{Number(product.price).toLocaleString()} each</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-brand-light-green text-brand-dark px-3 py-1 rounded-full text-xs font-medium">{product.category || "Fresh produce"}</span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">{product.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-brand-dark">Recent Orders</h2>
              <Link to="/farmer/orders" className="text-sm text-brand-green font-medium">Manage orders</Link>
            </div>

            {ordersLoading ? (
              <p className="text-sm text-gray-500">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-gray-600">No recent orders.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order._id || order.id} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Order {order._id || order.id}</p>
                        <p className="text-sm text-gray-600">Buyer: {order.buyerId?.name || order.buyerId?.email || '—'}</p>
                        <p className="text-sm text-gray-600">Items: {order.items?.length || 0}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white">{order.status}</span>
                        <div className="flex gap-2">
                          {order.status !== 'confirmed' && (
                            <button
                              onClick={async () => {
                                try {
                                  await updateOrderStatus(order._id || order.id, 'confirmed');
                                  setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, status: 'confirmed' } : o)));
                                } catch (err) {
                                  console.error('Failed to update status', err);
                                }
                              }}
                              className="text-sm bg-brand-green text-white px-3 py-1 rounded-full"
                            >
                              Confirm
                            </button>
                          )}

                          {order.status === 'confirmed' && (
                            <button
                              onClick={async () => {
                                try {
                                  await updateOrderStatus(order._id || order.id, 'out_for_delivery');
                                  setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, status: 'out_for_delivery' } : o)));
                                } catch (err) {
                                  console.error('Failed to update status', err);
                                }
                              }}
                              className="text-sm bg-orange-500 text-white px-3 py-1 rounded-full"
                            >
                              Out for delivery
                            </button>
                          )}

                          {order.status !== 'delivered' && (
                            <button
                              onClick={async () => {
                                try {
                                  await updateOrderStatus(order._id || order.id, 'delivered');
                                  setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, status: 'delivered' } : o)));
                                } catch (err) {
                                  console.error('Failed to update status', err);
                                }
                              }}
                              className="text-sm bg-brand-dark text-white px-3 py-1 rounded-full"
                            >
                              Mark delivered
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <aside className="bg-brand-light-green rounded-2xl p-5 h-fit">
            <h2 className="text-xl font-semibold text-brand-dark mb-4">Farmer profile</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <p className="font-medium text-brand-dark">Business</p>
                <p>{user?.farmName || "FreshLink Farmer"}</p>
              </div>
              <div>
                <p className="font-medium text-brand-dark">Location</p>
                <p>{user?.location || "Not set yet"}</p>
              </div>
              <div>
                <p className="font-medium text-brand-dark">Email</p>
                <p>{user?.email || "Not available"}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
