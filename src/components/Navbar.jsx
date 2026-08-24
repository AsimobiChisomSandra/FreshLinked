import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <nav className="bg-brand-dark text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-xl font-bold text-brand-light-green">
        Fresh<span className="text-brand-accent">Link</span>
      </Link>

      <div className="hidden md:flex gap-8 text-sm font-medium items-center">
        <Link to="/" className="hover:text-brand-accent transition">Home</Link>
        <Link to="/marketplace" className="hover:text-brand-accent transition">Marketplace</Link>
        <Link to="/cart" className="hover:text-brand-accent transition">Cart ({itemCount})</Link>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="hidden sm:inline text-sm text-gray-200">Hi, {user.name?.split(" ")[0] || "there"}</span>
            <button
              type="button"
              onClick={logout}
              className="bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-full text-sm font-semibold"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-brand-accent transition text-sm font-medium">Login</Link>
            <Link
              to="/register"
              className="bg-brand-green hover:bg-brand-accent transition px-4 py-2 rounded-full text-sm font-semibold"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
