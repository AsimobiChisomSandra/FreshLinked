import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function OrderConfirmation() {
  const { orderId } = useParams();

  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-light-green text-3xl">✅</div>
        <h1 className="text-3xl font-bold text-brand-dark mt-6">Order placed successfully</h1>
        <p className="text-gray-600 mt-3">
          Your fresh produce order has been received and is now being prepared.
        </p>

        <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 text-left">
          <p className="text-sm text-gray-500">Order reference</p>
          <p className="text-xl font-bold text-brand-dark">{orderId}</p>
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <div className="flex justify-between"><span>Status</span><span className="font-medium text-brand-green">Pending</span></div>
            <div className="flex justify-between"><span>Pickup / delivery</span><span>Confirmed</span></div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/marketplace" className="bg-brand-green text-white px-6 py-3 rounded-full font-semibold">
            Continue shopping
          </Link>
          <Link to="/" className="border border-gray-300 px-6 py-3 rounded-full font-semibold text-gray-700">
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
