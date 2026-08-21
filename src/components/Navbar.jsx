import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-brand-dark text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-xl font-bold text-brand-light-green">
        Fresh<span className="text-brand-accent">Link</span>
      </Link>

      <div className="hidden md:flex gap-8 text-sm font-medium">
        <Link to="/" className="hover:text-brand-accent transition">Home</Link>
        <Link to="/marketplace" className="hover:text-brand-accent transition">Marketplace</Link>
        <Link to="/login" className="hover:text-brand-accent transition">Login</Link>
      </div>

      <Link
        to="/register"
        className="bg-brand-green hover:bg-brand-accent transition px-4 py-2 rounded-full text-sm font-semibold"
      >
        Sign Up
      </Link>
    </nav>
  );
}
