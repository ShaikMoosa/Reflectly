'use client';

import React, { useState, useEffect } from 'react';
import { FlowNode, FlowConnection } from './types';

interface FlowPropertyPanelProps {
  selectedNodes: FlowNode[];
  selectedConnections: FlowConnection[];
  readOnly?: boolean;
  onUpdateNodeData: (nodeId: string, data: any) => void;
  onUpdateConnectionLabel: (connectionId: string, label: string) => void;
  onClose: () => void;
}

export default function FlowPropertyPanel({
  selectedNodes,
  selectedConnections,
  readOnly = false,
  onUpdateNodeData,
  onUpdateConnectionLabel,
  onClose,
}: FlowPropertyPanelProps) {
  // Local state for form values
  const [nodeForm, setNodeForm] = useState<any>({});
  const [connectionForm, setConnectionForm] = useState<any>({});
  
  // Update local state when selection changes
  useEffect(() => {
    if (selectedNodes.length === 1) {
      const node = selectedNodes[0];
      setNodeForm({
        title: node.data.title || '',
        icon: node.data.icon || '',
        ...node.data.properties,
      });
    } else {
      setNodeForm({});
    }
    
    if (selectedConnections.length === 1) {
      const connection = selectedConnections[0];
      setConnectionForm({
        label: connection.label || '',
        type: connection.type || 'default',
      });
    } else {
      setConnectionForm({});
    }
  }, [selectedNodes, selectedConnections]);
  
  // Handle node form change
  const handleNodeFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (readOnly) return;
    
    const { name, value } = e.target;
    setNodeForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle connection form change
  const handleConnectionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (readOnly) return;
    
    const { name, value } = e.target;
    setConnectionForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Save node changes
  const handleNodeFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly || selectedNodes.length !== 1) return;
    
    const nodeId = selectedNodes[0].id;
    
    // Extract basic properties and custom properties
    const { title, icon, ...properties } = nodeForm;
    
    onUpdateNodeData(nodeId, {
      title,
      icon,
      properties,
    });
  };
  
  // Save connection changes
  const handleConnectionFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly || selectedConnections.length !== 1) return;
    
    const connectionId = selectedConnections[0].id;
    onUpdateConnectionLabel(connectionId, connectionForm.label);
    
    // In a real implementation, we'd also update other connection properties
  };
  
  return (
    <div className="flow-property-panel w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
          {selectedNodes.length > 0
            ? selectedNodes.length === 1
              ? 'Node Properties'
              : `${selectedNodes.length} nodes selected`
            : selectedConnections.length === 1
            ? 'Connection Properties'
            : selectedConnections.length > 1
            ? `${selectedConnections.length} connections selected`
            : 'Properties'}
        </h3>
        <button
          className="w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onClose}
          aria-label="Close properties panel"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
      
      {/* Panel content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Node properties form */}
        {selectedNodes.length === 1 && (
          <form onSubmit={handleNodeFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={nodeForm.title || ''}
                onChange={handleNodeFormChange}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                placeholder="Node title"
                disabled={readOnly}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Icon
              </label>
              <input
                type="text"
                name="icon"
                value={nodeForm.icon || ''}
                onChange={handleNodeFormChange}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                placeholder="Emoji or icon"
                disabled={readOnly}
              />
            </div>
            
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Custom Properties
              </h4>
              
              {/* Display existing properties */}
              {Object.entries(nodeForm)
                .filter(([key]) => !['title', 'icon'].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {key}
                    </label>
                    <input
                      type="text"
                      name={key}
                      value={String(value)}
                      onChange={handleNodeFormChange}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                      disabled={readOnly}
                    />
                  </div>
                ))}
              
              {/* Add property button (only if not read-only) */}
              {!readOnly && (
                <button
                  type="button"
                  className="mt-2 w-full px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-md"
                >
                  + Add Property
                </button>
              )}
            </div>
            
            {/* Submit button */}
            {!readOnly && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  className="w-full px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        )}
        
        {/* Connection properties form */}
        {selectedConnections.length === 1 && (
          <form onSubmit={handleConnectionFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Label
              </label>
              <input
                type="text"
                name="label"
                value={connectionForm.label || ''}
                onChange={handleConnectionFormChange}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                placeholder="Connection label"
                disabled={readOnly}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Type
              </label>
              <select
                name="type"
                value={connectionForm.type || 'default'}
                onChange={handleConnectionFormChange}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                disabled={readOnly}
              >
                <option value="default">Default</option>
                <option value="dashed">Dashed</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
              </select>
            </div>
            
            {/* Submit button */}
            {!readOnly && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  className="w-full px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        )}
        
        {/* Multiple selection or no selection */}
        {(selectedNodes.length > 1 || selectedConnections.length > 1 || (selectedNodes.length === 0 && selectedConnections.length === 0)) && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            {selectedNodes.length > 1 || selectedConnections.length > 1 ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400 dark:text-gray-500 mb-3"
                >
                  <rect width="8" height="8" x="2" y="2" rx="2" />
                  <rect width="8" height="8" x="14" y="2" rx="2" />
                  <rect width="8" height="8" x="2" y="14" rx="2" />
                  <rect width="8" height="8" x="14" y="14" rx="2" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {`Multiple ${selectedNodes.length > 0 ? 'nodes' : 'connections'} selected`}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Select a single element to edit properties
                </p>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400 dark:text-gray-500 mb-3"
                >
                  <path d="M17 7 7 17" />
                  <path d="M7 7h10v10" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No element selected
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Select a node or connection to edit properties
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 