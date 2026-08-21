function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default function FreshnessTimeline({ product }) {
  const steps = [
    { label: "Harvested", date: product.harvestDate },
    { label: "Listed", date: product.harvestDate },
    { label: "Verified", date: product.harvestDate },
    { label: "Now", date: new Date().toISOString() },
  ];

  return (
    <div className="bg-brand-light-green rounded-2xl p-6 border border-brand-green/20">
      <h3 className="font-bold text-brand-dark text-lg mb-4">Freshness Timeline</h3>

      <div className="flex items-center justify-between mb-6">
        {steps.map((step, i) => (
          <div key={i} className="flex-1 flex flex-col items-center relative">
            {i !== 0 && (
              <div className="absolute top-2 right-1/2 w-full h-0.5 bg-brand-green -z-0" />
            )}
            <div className="w-4 h-4 rounded-full bg-brand-green z-10" />
            <span className="text-xs mt-2 font-medium text-brand-dark">{step.label}</span>
            <span className="text-xs text-gray-500">{formatDate(step.date)}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {product.noRipeningAgentPledge && (
          <div className="flex items-center gap-2 text-sm text-brand-green font-medium">
            ✅ Farmer attestation: No chemical ripening agents used
          </div>
        )}
        <div className="flex items-center gap-2 text-sm font-medium text-brand-dark">
          🛡️ Trust Score: {product.trustScore}/100
        </div>
      </div>
    </div>
  );
}
