import { Link } from "react-router-dom";

function daysAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function ProductCard({ product }) {
  const harvested = daysAgo(product.harvestDate);

  return (
    <Link
      to={`/product/${product._id}`}
      className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={product.photo}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {product.verifiedBadge && (
          <span className="absolute top-2 left-2 bg-brand-green text-white text-xs font-semibold px-2 py-1 rounded-full">
            ✅ Verified
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-brand-dark text-lg">{product.name}</h3>
        <p className="text-brand-accent font-bold mt-1">
          ₦{product.price.toLocaleString()} / {product.unit}
        </p>

        <div className="mt-2 text-sm text-gray-600 flex items-center gap-1">
          🟢 Harvested {harvested === 0 ? "today" : `${harvested} day${harvested > 1 ? "s" : ""} ago`}
        </div>

        {product.noRipeningAgentPledge && (
          <div className="mt-1 text-sm text-brand-green font-medium">
            🛡️ No ripening agents used
          </div>
        )}

        <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
          <span>⭐ {product.rating} ({product.reviewCount})</span>
          <span>{product.farmerName}</span>
        </div>
      </div>
    </Link>
  );
}
