import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items, subtotal, itemCount, updateQuantity, removeFromCart, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-brand-dark">Your cart is empty</h1>
          <p className="text-gray-600 mt-3">Add fresh produce from the marketplace to get started.</p>
          <Link to="/marketplace" className="mt-6 inline-block bg-brand-green text-white px-6 py-3 rounded-full font-semibold">
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-brand-dark">Shopping Cart</h1>
          <button onClick={clearCart} className="text-sm text-gray-600 hover:text-brand-green">
            Clear cart
          </button>
        </div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-4">
                <img src={item.photo} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
                <div className="flex-1">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-brand-dark">{item.name}</h2>
                      <p className="text-sm text-gray-600">{item.farmerName}</p>
                    </div>
                    <p className="font-semibold text-brand-accent">₦{(item.price * item.quantity).toLocaleString()}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 text-lg"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 text-lg"
                      >
                        +
                      </button>
                    </div>

                    <button onClick={() => removeFromCart(item._id)} className="text-sm text-red-600 hover:underline">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="bg-brand-light-green rounded-2xl p-6 h-fit">
            <h2 className="text-lg font-semibold text-brand-dark">Order Summary</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Items</span>
                <span>{itemCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            <div className="mt-6 border-t border-gray-200 pt-4 flex justify-between font-semibold text-brand-dark">
              <span>Total</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            <Link
              to="/checkout"
              className="mt-6 block text-center bg-brand-green text-white font-semibold py-3 rounded-full"
            >
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
