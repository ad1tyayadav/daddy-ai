"use client";

import { motion } from "motion/react";

export default function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex text w-full rounded-xl border border-neutral-200/40 bg-white/60 p-1 backdrop-blur-md dark:border-neutral-700/60 dark:bg-black/60">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex-1 rounded sm:px-4 py-2 text-sm font-medium transition-colors
              ${isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-neutral-600 hover:text-blue-500 dark:text-neutral-400 dark:hover:text-blue-400"
              }`}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="active-tab-highlight"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-400/10 dark:to-blue-500/10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
