"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/app/utils/cn";

type Plan = {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  highlighted: boolean;
  lemonSqueezyUrl?: string;
};

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "For casual users who want to try the platform",
    price: 0,
    features: [
      "5 video transcriptions",
      "5 AI chat queries",
      "Basic note-taking",
      "Standard video quality",
      "Community support",
    ],
    highlighted: false,
  },
  {
    id: "premium",
    name: "Premium",
    description: "For professionals who need advanced features",
    price: 20,
    features: [
      "50 video transcriptions",
      "1000 AI chat sessions",
      "Advanced note-taking",
      "High quality video",
      "Priority support",
      "Advanced analytics",
      "Custom organization",
    ],
    highlighted: true,
    lemonSqueezyUrl: "https://reflectly.lemonsqueezy.com/buy/7732cab7-c161-47ce-b210-f706ab1d901a",
  },
];

export function PricingCards() {
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  
  return (
    <div className="py-20" id="pricing">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
            Choose the plan that fits your needs. Start with our free plan to explore the platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              className={cn(
                "relative overflow-hidden rounded-2xl p-8 border transition-all duration-300",
                plan.highlighted
                  ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800",
                hoveredPlan === plan.id && "shadow-xl transform -translate-y-1"
              )}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: plan.highlighted ? 0.1 : 0 }}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0">
                  <div className="bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-md transform rotate-0 origin-top-right">
                    Popular
                  </div>
                </div>
              )}
              
              <div className="mb-5">
                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <p className="text-gray-500 dark:text-gray-400">{plan.description}</p>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <svg
                      className={cn(
                        "w-5 h-5",
                        plan.highlighted ? "text-blue-500" : "text-green-500"
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {plan.price === 0 ? (
                <Link
                  href="/sign-up"
                  className={cn(
                    "block w-full py-3 px-4 rounded-lg text-center font-medium transition-colors",
                    "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                  )}
                >
                  Get Started Free
                </Link>
              ) : (
                <Link
                  href="/api/subscription"
                  className={cn(
                    "block w-full py-3 px-4 rounded-lg text-center font-medium transition-colors",
                    "bg-blue-500 hover:bg-blue-600 text-white"
                  )}
                >
                  Subscribe Now
                </Link>
              )}
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            All plans include a 14-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </div>
  );
} 