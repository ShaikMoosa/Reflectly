"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { WavyBackground } from "@/components/ui/wavy-background";

export function HeroParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  return (
    <section className="relative w-full h-[90vh]" id="hero">
      <WavyBackground 
        containerClassName="absolute inset-0"
        className="flex items-center justify-center"
        colors={["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee"]}
        waveWidth={100}
        backgroundFill="black"
        blur={10}
        speed="fast"
        waveOpacity={0.5}
      >
        <div ref={ref} className="relative flex items-center justify-center">
          {/* Hero content */}
          <motion.div 
            className="relative z-20 text-center max-w-5xl px-4"
            style={{ 
              opacity: contentOpacity, 
              y: contentY 
            }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Transform Your Video Content With AI
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Transcribe videos, chat with AI, and extract insights from your content with Reflectly.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link 
                href="/sign-up" 
                className="px-8 py-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors text-lg"
              >
                Get Started Free
              </Link>
              <Link 
                href="#pricing" 
                className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium transition-colors text-lg"
              >
                View Pricing
              </Link>
            </motion.div>
            
            <motion.div 
              className="mt-16 text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <p>Free plan includes 5 transcriptions and 5 AI chat sessions</p>
            </motion.div>
          </motion.div>
        </div>
      </WavyBackground>
    </section>
  );
} 