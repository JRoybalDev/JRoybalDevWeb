import { motion } from "framer-motion";

export default function LoadingPage() {
  return (
    <div className="app-shell">
      <div className="card">
        <div className="brand">
          <p className="eyebrow">Ultimate Bun Starter</p>
          <h1>Loading…</h1>
        </div>
        <div className="panel">
          <div className="flex justify-center items-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full bg-blue-500"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
