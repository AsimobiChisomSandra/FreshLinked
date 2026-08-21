import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import FreshnessTimeline from "../components/FreshnessTimeline";
import mockProducts from "../data/mockProducts";

export default function ProductDetail() {
  const { id } = useParams();
  const product = mockProducts.find((p) => p._id === id);

  if (!product) {
    return (
      <div>
        <Navbar />
        <div className="px-6 py-20 text-center">
          <p className="text-gray-500">Product not found.</p>
          <Link to="/marketplace" className="text-brand-green underline">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div className="px-6 py-10 max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
        <div>
          <img
            src={product.photo}
            alt={product.name}
            className="w-full h-80 object-cover rounded-2xl"
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-brand-dark">{product.name}</h1>
          <p className="text-gray-500">{product.location} · Sold by {product.farmerName}</p>
          <p className="text-2xl font-bold text-brand-accent mt-3">
            ₦{product.price.toLocaleString()} / {product.unit}
          </p>

          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            ⭐ {product.rating} ({product.reviewCount} reviews)
          </div>

          <button className="mt-6 w-full bg-brand-green hover:bg-brand-accent transition text-white font-semibold py-3 rounded-full">
            Add to Cart
          </button>

          <div className="mt-8">
            <FreshnessTimeline product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
