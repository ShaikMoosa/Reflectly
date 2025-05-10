"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "What is Reflectly?",
    answer: "Reflectly is an all-in-one platform for transcribing videos, chatting with AI about your content, and organizing your insights. It helps content creators, educators, and professionals extract more value from their video content.",
  },
  {
    question: "How accurate is the transcription?",
    answer: "Our transcription service is powered by cutting-edge AI technology and achieves over 95% accuracy for clear audio in English. We also support multiple languages with varying degrees of accuracy.",
  },
  {
    question: "What's the difference between the Free and Premium plans?",
    answer: "The Free plan includes 5 video transcriptions and 5 AI chat queries, perfect for trying out the platform. The Premium plan ($20/month) includes 50 video transcriptions, 1000 AI chat sessions, advanced analytics, and priority support.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. If you cancel, you'll still have access to premium features until the end of your billing period. We also offer a 14-day money-back guarantee for new Premium subscribers.",
  },
  {
    question: "What file formats are supported for transcription?",
    answer: "We support most common video formats including MP4, MOV, AVI, and WMV. For audio-only files, we support MP3, WAV, M4A, and others. The maximum file size is 2GB for the Premium plan and 500MB for the Free plan.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take data security very seriously. All your data is encrypted both in transit and at rest. We don't share your content with third parties, and you retain all rights to your transcriptions and notes.",
  },
  {
    question: "Do you offer team or enterprise plans?",
    answer: "We're currently working on team and enterprise plans with additional features like team collaboration, advanced permissions, and higher usage limits. Contact us for more information.",
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  
  return (
    <div className="py-20 bg-gray-50 dark:bg-gray-900" id="faq">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
            Have questions? We've got answers.
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
            >
              <button
                className="w-full text-left p-6 flex justify-between items-center focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-xl font-medium">{faq.question}</h3>
                <div className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-gray-500 dark:text-gray-400">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Still have questions? <Link href="/contact" className="text-blue-500 hover:underline">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 