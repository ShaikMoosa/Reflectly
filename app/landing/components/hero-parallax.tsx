"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

export function HeroParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageScroll = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  return (
    <div 
      ref={ref} 
      className="w-full h-screen overflow-hidden relative flex items-center justify-center"
      style={{ perspective: "1000px" }}
    >
      {/* Background parallax layers */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ 
          backgroundImage: "url(/images/hero-bg-1.jpg)", 
          backgroundSize: "cover",
          backgroundPosition: "center",
          y: imageScroll,
          scale: 1.2,
        }}
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/70 to-gray-950/90 z-10" />

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
      
      {/* Floating elements for decoration */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-1/4 right-[15%] w-64 h-64 rounded-full bg-blue-500/20 blur-3xl"
          animate={{ 
            x: [0, 10, 0],
            y: [0, 15, 0], 
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-[20%] w-72 h-72 rounded-full bg-purple-500/20 blur-3xl"
          animate={{ 
            x: [0, -15, 0],
            y: [0, 10, 0], 
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
      </div>
    </div>
  );
} 