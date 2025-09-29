"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { ContainerTextFlipDemo } from "./HeroAnimatedText";
import { Spotlight } from "./ui/spotlight";
import Image from "next/image";

export function HeroSectionOne() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="">
      <Spotlight className="sm:absolute sm:-right-40 -top-20" />
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80"></div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80"></div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80"></div>

      <div className="px-4 py-10 md:py-20">
        <h1 className="relative leading-tight z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-100">
          {"Upload  your  Resume, and get "
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
          <ContainerTextFlipDemo />
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
        >
          Upload your resume, paste the job description, and let{" "}
          <span className="text-white">Daddy AI</span> deliver feedback, tailored
          questions, and career strategies instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/resume"
            className="w-52 text-center transform rounded-lg bg-black py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Try Now!
          </Link>

          <button
            onClick={() => setShowModal(true)}
            className="w-60 transform rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-white dark:hover:bg-gray-900"
          >
            Don&apos;t Click Me
          </button>
        </motion.div>
      </div>

      {/* Meme + QR Code Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-center mb-4">

            </h2>

            {/* Meme */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <Image
              src="/images/Gareeb.png"
              alt="Meme"
              width={200}
              height={200}
              className="w-full rounded-md mb-4"
            />
            <p className="text-center mt-4 text-gray-700 dark:text-gray-300">
              Scan the QR code and pay me whatever you want 💸
            </p>

            {/* QR Code */}
            <div className="mt-6 flex justify-center rounded">
              <Image
                src="/images/qr.png"
                alt="Pay Me QR Code"
                width={400}
                height={200}
                className="w-[50%] rounded object-contain"
              />
            </div>


          </div>
        </div>
      )}
    </div>
  );
}