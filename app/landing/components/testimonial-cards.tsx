"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Testimonial = {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Content Creator",
    content: "Reflectly has changed how I create content. The transcription is so accurate, and the AI chat helps me extract insights I would have missed.",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Podcast Host",
    content: "As a podcast host, I need to review hours of content. Reflectly's transcription and summarization features have saved me countless hours.",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Marketing Director",
    content: "The premium plan is well worth it. Being able to transcribe 50 videos and have unlimited AI chat has been a game-changer for our content strategy.",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    id: 4,
    name: "David Kim",
    role: "Educator",
    content: "I use Reflectly to transcribe my lectures and create notes for my students. It's been an invaluable tool in my teaching workflow.",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
    id: 5,
    name: "Jessica Patel",
    role: "Video Producer",
    content: "The AI chat feature helps me quickly find important moments in long videos. I wouldn't be able to work as efficiently without Reflectly.",
    avatar: "https://randomuser.me/api/portraits/women/5.jpg",
  },
];

export function TestimonialCards() {
  const [cards, setCards] = useState(testimonials);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCards((prevCards) => {
        const newCards = [...prevCards];
        const lastCard = newCards.pop();
        if (lastCard) {
          newCards.unshift(lastCard);
        }
        return newCards;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="py-20 bg-gray-50 dark:bg-[#242424]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
            Join thousands of satisfied users who are transforming how they work with video content.
          </p>
        </div>
        
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="relative w-full max-w-md">
            {cards.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="absolute top-0 left-0 right-0 bg-white dark:bg-[#2a2a2a] p-6 rounded-xl shadow-lg border border-gray-200 dark:border-[#383838]"
                initial={{ scale: 1, y: 0 }}
                animate={{
                  scale: 1 - index * 0.05,
                  y: index * -20,
                  zIndex: cards.length - index,
                  opacity: index > 3 ? 0 : 1,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{testimonial.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  "{testimonial.content}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 