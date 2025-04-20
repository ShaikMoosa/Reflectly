'use client';

import React from 'react';

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  // Add other properties as needed
}

interface UserListProps {
  collaborators: User[] | null | undefined;
  onSelect?: (user: User) => void;
  selectedIds?: string[];
}

const UserList: React.FC<UserListProps> = ({ 
  collaborators = [], // Default to empty array
  onSelect,
  selectedIds = []
}) => {
  // Ensure collaborators is always an array
  const userList = Array.isArray(collaborators) ? collaborators : [];
  
  return (
    <div className="user-list">
      {userList.length === 0 ? (
        <div className="py-4 text-center text-gray-500 dark:text-gray-400">
          No users to display
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {userList.map((user) => (
            <li 
              key={user.id}
              className={`flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                ${selectedIds.includes(user.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                ${onSelect ? 'cursor-pointer' : ''}
              `}
              onClick={() => onSelect && onSelect(user)}
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 mr-3 overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg font-medium">
                    {user.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                {user.email && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserList; 