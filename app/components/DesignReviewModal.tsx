'use client';

import React, { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { Requirement } from '../models/kanban';
import { v4 as uuidv4 } from 'uuid';

interface DesignReviewModalProps {
  isOpen: boolean;
  requirements: Requirement[];
  onClose: () => void;
  onCreateReview: (review: any) => void;
}

const DesignReviewModal: React.FC<DesignReviewModalProps> = ({
  isOpen,
  requirements,
  onClose,
  onCreateReview
}) => {
  const [reviewName, setReviewName] = useState('');
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [reviewType, setReviewType] = useState('formal');
  const [dueDate, setDueDate] = useState('');
  const [reviewers, setReviewers] = useState<string[]>([]);
  
  const handleRequirementToggle = (requirementId: string) => {
    setSelectedRequirements(prev => 
      prev.includes(requirementId)
        ? prev.filter(id => id !== requirementId)
        : [...prev, requirementId]
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create review object
    const review = {
      id: uuidv4(),
      name: reviewName,
      type: reviewType,
      dueDate,
      requirementIds: selectedRequirements,
      reviewers,
      createdAt: new Date().toISOString(),
      status: 'Pending'
    };
    
    onCreateReview(review);
    
    // Reset form
    setReviewName('');
    setSelectedRequirements([]);
    setReviewType('formal');
    setDueDate('');
    setReviewers([]);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl mx-4 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create Design Review
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Review Name*
              </label>
              <input
                type="text"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g. Design Review for TENS Device v1.0"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Review Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reviewType"
                    value="formal"
                    checked={reviewType === 'formal'}
                    onChange={() => setReviewType('formal')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Formal</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reviewType"
                    value="informal"
                    checked={reviewType === 'informal'}
                    onChange={() => setReviewType('informal')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Informal</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reviewers (comma-separated)
              </label>
              <input
                type="text"
                value={reviewers.join(', ')}
                onChange={(e) => setReviewers(e.target.value.split(',').map(r => r.trim()))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g. Bob Smith, Alice Johnson"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Requirements to Review*
              </label>
              <div className="overflow-y-auto max-h-64 border border-gray-300 dark:border-gray-700 rounded-md">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        <input
                          type="checkbox"
                          checked={selectedRequirements.length === requirements.length}
                          onChange={() => {
                            if (selectedRequirements.length === requirements.length) {
                              setSelectedRequirements([]);
                            } else {
                              setSelectedRequirements(requirements.map(r => r.id));
                            }
                          }}
                          className="rounded text-blue-600"
                        />
                      </th>
                      <th scope="col" className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Code</th>
                      <th scope="col" className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Title</th>
                      <th scope="col" className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-300 dark:divide-gray-700">
                    {requirements.map(requirement => (
                      <tr 
                        key={requirement.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => handleRequirementToggle(requirement.id)}
                      >
                        <td className="py-2 px-3 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedRequirements.includes(requirement.id)}
                            onChange={() => handleRequirementToggle(requirement.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded text-blue-600"
                          />
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap text-xs font-mono text-gray-500 dark:text-gray-400">
                          {requirement.code}
                        </td>
                        <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
                          {requirement.title}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {selectedRequirements.length === 0 && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle size={16} className="mr-1" />
                  Please select at least one requirement
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reviewName || selectedRequirements.length === 0}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                !reviewName || selectedRequirements.length === 0
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Create Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DesignReviewModal; 