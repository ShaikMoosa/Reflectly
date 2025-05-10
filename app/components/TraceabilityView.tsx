'use client';

import React, { useState } from 'react';
import { Requirement } from '../models/kanban';
import { ChevronDown, ChevronRight, Link as LinkIcon, Download } from 'lucide-react';

interface TraceabilityViewProps {
  requirements: Requirement[];
  onRequirementClick: (requirement: Requirement) => void;
}

const TraceabilityView: React.FC<TraceabilityViewProps> = ({
  requirements,
  onRequirementClick
}) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (requirementId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [requirementId]: !prev[requirementId]
    }));
  };

  const exportTraceability = () => {
    // Would handle exporting traceability matrix to CSV or PDF
    alert('Export functionality would generate a traceability report.');
  };

  const sortedRequirements = [...requirements].sort((a, b) => {
    // Sort by code first
    if (a.code && b.code) {
      return a.code.localeCompare(b.code);
    }
    
    // Fall back to title if no code
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="font-semibold text-gray-900 dark:text-white">Traceability Matrix</h2>
        <button
          onClick={exportTraceability}
          className="flex items-center px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Download size={14} className="mr-1" />
          Export
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="py-3 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                Code
              </th>
              <th scope="col" className="py-3 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                Title
              </th>
              <th scope="col" className="py-3 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th scope="col" className="py-3 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                Component
              </th>
              <th scope="col" className="py-3 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                Owner
              </th>
              <th scope="col" className="py-3 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                Tags
              </th>
              <th scope="col" className="py-3 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                Links
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-300 dark:divide-gray-700">
            {sortedRequirements.map(requirement => (
              <React.Fragment key={requirement.id}>
                {/* Main Requirement Row */}
                <tr
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => onRequirementClick(requirement)}
                >
                  <td className="py-3 px-3 whitespace-nowrap text-xs font-mono text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      {requirement.links && requirement.links.length > 0 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(requirement.id);
                          }}
                          className="mr-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {expandedRows[requirement.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      ) : (
                        <span className="w-5" />
                      )}
                      {requirement.code}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                    {requirement.title}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      requirement.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      requirement.status === 'In Review' ? 'bg-purple-100 text-purple-800' :
                      requirement.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      requirement.status === 'New' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {requirement.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300">
                    {requirement.component?.name || '—'}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {requirement.owner ? (
                      <div className="flex items-center">
                        <img
                          src={requirement.owner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(requirement.owner.name)}&size=24`}
                          alt={requirement.owner.name}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {requirement.owner.name}
                        </span>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {requirement.tags && requirement.tags.map(tag => (
                        <span
                          key={tag.id}
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            tag.color ? `bg-${tag.color}-100 text-${tag.color}-800` : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {tag.name}
                        </span>
                      ))}
                      {(!requirement.tags || requirement.tags.length === 0) && '—'}
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {requirement.links && requirement.links.length > 0 ? (
                      <div className="flex items-center text-blue-600 dark:text-blue-400">
                        <LinkIcon size={14} className="mr-1" />
                        {requirement.links.length} Links
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
                
                {/* Expanded Links Rows */}
                {expandedRows[requirement.id] && requirement.links && requirement.links.length > 0 && (
                  <tr className="bg-gray-50 dark:bg-gray-900/30">
                    <td colSpan={7} className="py-2 px-8">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Linked Items
                      </div>
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                          <tr>
                            <th scope="col" className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                              Type
                            </th>
                            <th scope="col" className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                              ID
                            </th>
                            <th scope="col" className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                              Relationship
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {requirement.links.map(link => (
                            <tr key={link.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="py-2 px-3 text-xs text-gray-700 dark:text-gray-300">
                                {link.targetType}
                              </td>
                              <td className="py-2 px-3 text-xs font-mono text-gray-700 dark:text-gray-300">
                                {link.targetId}
                              </td>
                              <td className="py-2 px-3 text-xs text-gray-700 dark:text-gray-300">
                                {link.linkType || 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TraceabilityView; 