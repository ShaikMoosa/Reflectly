'use client'

import React, { useState, useEffect } from 'react'
import { Menu, X, Home, FileText, Calendar, Pencil, Settings, BookOpen, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  className?: string
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar')
      if (sidebar && !sidebar.contains(event.target as Node) && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Notes', href: '/notes', icon: FileText },
    { name: 'Planner', href: '/planner', icon: Calendar },
    { name: 'Whiteboard', href: '/whiteboard', icon: Pencil },
    { name: 'Documents', href: '/documents', icon: BookOpen },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-40 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md lg:hidden transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed top-0 left-0 z-30 h-screen bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20 hover:w-64'
        } ${className}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 flex items-center justify-center">
            <span className="text-xl font-bold text-primary transition-all duration-300">
              {isOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 'Reflectly' : 'R'}
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="flex-grow py-6">
            <ul className="space-y-2 px-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center p-3 rounded-lg group transition-all duration-200 ${
                        isActive
                          ? 'bg-primary bg-opacity-20 text-primary font-medium'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon size={20} className={isActive ? 'text-primary' : ''} />
                        <span
                          className={`ml-4 transition-all duration-300 ${
                            !(isOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024))
                              ? 'opacity-0 w-0'
                              : 'opacity-100 w-auto'
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer with theme toggle */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              <span
                className={`ml-4 transition-all duration-300 ${
                  !(isOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024))
                    ? 'opacity-0 w-0'
                    : 'opacity-100 w-auto'
                }`}
              >
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar 