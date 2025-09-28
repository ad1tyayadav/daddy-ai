/* eslint-disable @next/next/no-img-element */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface UpgradePopupProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: "feedback" | "questions" | "both";
}

export default function UpgradePopup({ isOpen, onClose, limitType }: UpgradePopupProps) {
  if (!isOpen) return null;

  const messageMap: Record<typeof limitType, string> = {
    feedback: "Resume feedback limit reached 🚫",
    questions: "Interview question limit reached 🚫",
    both: "API limit reached...",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur bg-black/70 p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="border border-neutral-700/50 bg-neutral-900/80 rounded-xl shadow-xl max-w-md w-full p-6 text-center relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              ✖
            </button>

            {/* Funny Meme */}
            <div className="mb-4">
              <img
                src="https://c.tenor.com/8FnHltWQJkYAAAAd/tenor.gif"
                alt="API Down Meme"
                width={300}
                height={200}
                className="rounded-lg mx-auto"
              />
            </div>

            <h2 className="text-xl font-bold mb-2">{messageMap[limitType]}</h2>
            <p className="text-gray-400 mb-4">
              Scan and send whatever you want 💸
            </p>

            {/* QR Code / Payment Link */}
            <div className="mb-4">
              <Image
                src="/images/qr.png"
                alt="Payment QR"
                width={180}
                height={180}
                className="mx-auto"
              />
            </div>

            <a
              href="https://razorpay.me/@shatrujeetyadav"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 bg-gray-800 hover:bg-gray-600 rounded-lg font-semibold text-white transition"
            >
             Pay now :)
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
