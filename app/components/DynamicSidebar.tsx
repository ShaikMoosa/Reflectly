'use client';

import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Home, FileText, Calendar, 
  Upload, BookOpen, PenTool, Settings, 
  Moon, Sun, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';

// Define sidebar navigation items
const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Notes', path: '/notes', icon: FileText },
  { name: 'Planner', path: '/planner', icon: Calendar },
  { name: 'Upload', path: '/upload', icon: Upload },
  { name: 'Transcript', path: '/transcript', icon: BookOpen },
  { name: 'Whiteboard', path: '/whiteboard', icon: PenTool },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function DynamicSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  
  // Handle responsive state
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsOpen(false);
    };
    
    // Initial check
    handleResize();
    
    // Add listener for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Toggle sidebar state
  const toggleSidebar = () => setIsOpen(!isOpen);
  
  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-800 
          transition-all duration-300 ease-in-out z-50 
          shadow-lg flex flex-col
          ${isOpen ? 'w-64' : 'w-20'}
          ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          {isOpen && (
            <h1 className="text-xl font-bold text-primary transition-opacity duration-200">
              Reflectly
            </h1>
          )}
          
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isOpen ? (
              isMobile ? <X className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link href={item.path} passHref>
                    <div
                      className={`
                        flex items-center p-3 rounded-lg transition-all
                        ${isActive 
                          ? 'bg-primary bg-opacity-10 text-primary font-medium' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                      
                      {isOpen && (
                        <span className="ml-3 transition-opacity duration-200">
                          {item.name}
                        </span>
                      )}
                      
                      {isActive && (
                        <div className="absolute w-1 h-8 bg-primary rounded-full -left-1" />
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Footer with theme toggle */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleTheme}
            className={`
              w-full p-3 flex items-center rounded-lg transition-colors
              hover:bg-gray-100 dark:hover:bg-gray-700
              ${isOpen ? 'justify-start' : 'justify-center'}
            `}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
            
            {isOpen && (
              <span className="ml-3 transition-opacity duration-200">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>
        </div>
      </aside>
      
      {/* Toggle button for mobile (outside sidebar) */}
      {isMobile && !isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
      
      {/* Main content wrapper */}
      <main
        className={`
          transition-all duration-300 ease-in-out
          ${isMobile 
            ? 'ml-0' 
            : isOpen ? 'ml-64' : 'ml-20'
          }
        `}
      >
        {/* This is where the page content will be rendered */}
      </main>
    </>
  );
} 