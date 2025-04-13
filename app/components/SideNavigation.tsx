'use client';

import React from 'react';
import { Home as HomeIcon, FolderOpen, Pencil, Kanban } from 'lucide-react';

type PageType = 'home' | 'projects' | 'whiteboard' | 'planner';

interface SideNavigationProps {
  activePage: PageType;
  onNavigate: (page: PageType) => void;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ 
  activePage, 
  onNavigate 
}) => {
  return (
    <div className="drawer lg:drawer-open fixed">
      <input id="drawer-toggle" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Page content will be rendered outside this component */}
      </div> 
      <div className="drawer-side">
        <label htmlFor="drawer-toggle" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu p-4 w-64 h-full bg-base-200 text-base-content">
          <li className="menu-title mb-4">
            <h2 className="text-xl font-bold">Reflectly</h2>
          </li>
          <li>
            <a 
              className={activePage === 'home' ? 'active' : ''}
              onClick={() => onNavigate('home')}
            >
              <HomeIcon size={20} />
              Home
            </a>
          </li>
          <li>
            <a 
              className={activePage === 'projects' ? 'active' : ''}
              onClick={() => onNavigate('projects')}
            >
              <FolderOpen size={20} />
              Projects
            </a>
          </li>
          <li>
            <a 
              className={activePage === 'whiteboard' ? 'active' : ''}
              onClick={() => onNavigate('whiteboard')}
            >
              <Pencil size={20} />
              Whiteboard
            </a>
          </li>
          <li>
            <a 
              className={activePage === 'planner' ? 'active' : ''}
              onClick={() => onNavigate('planner')}
            >
              <Kanban size={20} />
              Planner
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SideNavigation; 