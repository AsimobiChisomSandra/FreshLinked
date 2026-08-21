import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import mockProducts from "../data/mockProducts";
import ProductCard from "../components/ProductCard";

export default function Home() {
  return (
    <div>
      <Navbar />

      <section className="relative overflow-hidden text-white px-6 py-28 md:py-36 text-center">
        {/* Background image with slow zoom */}
        <div
          className="absolute inset-0 bg-cover bg-center animate-kenburns"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=1600&q=80')",
          }}
        />
        {/* Dark green wash — image stays visible underneath */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/90 via-brand-green/70 to-brand-dark/90" />

        <div className="relative z-10">
          <span className="animate-fade-up inline-block bg-white/10 backdrop-blur-sm border border-white/20 text-sm px-4 py-1.5 rounded-full mb-5">
            🌿 Where safety meets freshness
          </span>

          <h1 className="animate-fade-up delay-100 text-3xl md:text-5xl font-bold max-w-2xl mx-auto leading-tight">
            Every app promises freshness.{" "}
            <span className="text-brand-accent">FreshLink proves it.</span>
          </h1>

          <p className="animate-fade-up delay-200 mt-4 text-gray-200 max-w-xl mx-auto">
            Get Fresh farm produce, verified from harvest delivered to your doorstep: with real safety
            transparency, not just marketing language.
          </p>

          <div className="animate-fade-up delay-300 mt-8 flex gap-4 justify-center flex-wrap">
            <Link
              to="/marketplace"
              className="bg-brand-green hover:bg-brand-accent transition px-6 py-3 rounded-full font-semibold shadow-lg shadow-black/20"
            >
              Browse Marketplace
            </Link>
            <Link
              to="/register"
              className="border border-white hover:bg-white hover:text-brand-dark transition px-6 py-3 rounded-full font-semibold"
            >
              Sell With Us
            </Link>
          </div>

          <div className="animate-fade-up delay-300 mt-10 flex justify-center gap-6 text-sm text-gray-200 flex-wrap">
            <span className="flex items-center gap-1.5">🛡️ Verified farmers</span>
            <span className="flex items-center gap-1.5">📊 Freshness timeline</span>
            <span className="flex items-center gap-1.5">🚚 Tracked delivery</span>
          </div>
        </div>

        {/* Floating decorative elements for a bit of life */}
        <div className="hidden md:block absolute top-16 left-10 text-4xl animate-float opacity-70">🥬</div>
        <div className="hidden md:block absolute bottom-16 right-14 text-4xl animate-float opacity-70" style={{ animationDelay: "1.5s" }}>🍅</div>
      </section>

      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-brand-dark text-center mb-10">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-2xl hover:bg-brand-light-green hover:-translate-y-1 transition duration-300">
            <div className="text-3xl mb-2">🌱</div>
            <h3 className="font-semibold mb-1">1. Farmer Lists Produce</h3>
            <p className="text-sm text-gray-600">
              With harvest date and a pledge against artificial ripening agents.
            </p>
          </div>
          <div className="p-6 rounded-2xl hover:bg-brand-light-green hover:-translate-y-1 transition duration-300">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold mb-1">2. Buyer Sees the Timeline</h3>
            <p className="text-sm text-gray-600">
              Verified freshness data, not vague promises.
            </p>
          </div>
          <div className="p-6 rounded-2xl hover:bg-brand-light-green hover:-translate-y-1 transition duration-300">
            <div className="text-3xl mb-2">🚚</div>
            <h3 className="font-semibold mb-1">3. Order, Track, Delivered</h3>
            <p className="text-sm text-gray-600">
              Full order tracking from farm to your table.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-brand-light-green">
        <h2 className="text-2xl font-bold text-brand-dark text-center mb-10">
          Featured Produce
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {mockProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
