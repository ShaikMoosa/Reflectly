"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";

interface FeatureCard {
  title: string;
  description: string;
  icon: JSX.Element;
}

export function CardHoverEffect() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Powerful Features</h2>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
          Everything you need to transcribe videos and get insights from your content.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, i) => (
          <CardContainer key={i}>
            <CardBody>
              <div className="flex flex-col gap-4 h-full">
                <div className="p-3 rounded-xl bg-gray-100 dark:bg-[#2a2a2a] w-14 h-14 flex items-center justify-center text-2xl">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-xl">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 flex-grow">{feature.description}</p>
              </div>
            </CardBody>
          </CardContainer>
        ))}
      </div>
    </div>
  );
}

interface CardContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContainer = ({
  children,
  className,
}: CardContainerProps) => {
  return (
    <div
      className={cn(
        "relative h-full group/card",
        className
      )}
    >
      <div className="h-full rounded-2xl p-6 border border-transparent dark:border-[#383838] bg-white dark:bg-[#262626] shadow-lg shadow-black/[0.03] backdrop-blur-[2px] transition duration-300 group-hover/card:shadow-xl group-hover/card:shadow-black/[0.1] group-hover/card:border-gray-200 dark:group-hover/card:border-[#484848]">
        {children}
      </div>
    </div>
  );
};

export const CardBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("relative z-10", className)}>
      {children}
    </div>
  );
};

const features: FeatureCard[] = [
  {
    title: "Video Transcription",
    description: "Transcribe videos with high accuracy, with up to 50 transcriptions on the premium plan.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H3.375c-.621 0-1.125-.504-1.125-1.125V6.375c0-.621.504-1.125 1.125-1.125H19.5c.621 0 1.125.504 1.125 1.125v12.75c0 .621-.504 1.125-1.125 1.125Z" />
      </svg>
    ),
  },
  {
    title: "AI Chat",
    description: "Chat with our AI to analyze your content and get insights, with up to 1000 messages on the premium plan.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
      </svg>
    ),
  },
  {
    title: "Smart Summaries",
    description: "Get automatic summaries of your transcriptions to quickly understand the content.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
      </svg>
    ),
  },
  {
    title: "Project Planning",
    description: "Organize your content into projects and plan your work with our Kanban board.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122" />
      </svg>
    ),
  },
  {
    title: "Notes & Annotations",
    description: "Take notes and annotate your transcriptions to capture important information.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      </svg>
    ),
  },
  {
    title: "Cross-Platform",
    description: "Access your content from any device, anywhere, with our cloud-based platform.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
      </svg>
    ),
  },
]; 