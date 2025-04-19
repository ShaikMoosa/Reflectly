'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { FlowData } from '../components/flow-editor/types';

// Dynamically import components to avoid SSR issues
const WhiteboardComponent = dynamic(
  () => import('../components/Whiteboard'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
          <p className="mt-4">Loading Whiteboard...</p>
        </div>
      </div>
    )
  }
);

const FlowEditorComponent = dynamic(
  () => import('../components/flow-editor/FlowEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
          <p className="mt-4">Loading Flow Editor...</p>
        </div>
      </div>
    )
  }
);

// Demo data for the flow editor
const demoFlowData: FlowData = {
  project: {
    id: 'project-demo',
    title: 'Resolve_Incident_Ticket',
    description: 'Workflow for resolving incident tickets',
    currentVersion: {
      id: 'v-1',
      name: 'V3 - Draft',
      description: 'Updated with new resolution step',
      timestamp: new Date().toISOString(),
      isApproved: false
    },
    versions: [
      {
        id: 'v-2',
        name: 'V2 - Approved',
        description: 'Production version',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        isApproved: true,
        approvedBy: 'John Doe'
      }
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Jane Smith'
  },
  nodes: [
    {
      id: 'node-1',
      type: 'default',
      position: { x: 250, y: 100 },
      data: {
        title: 'Get User',
        icon: '👤',
        properties: {
          source: 'Active Directory',
          required: 'true'
        }
      },
      width: 180,
      height: 100
    },
    {
      id: 'node-2',
      type: 'default',
      position: { x: 500, y: 100 },
      data: {
        title: 'Verify Ticket',
        icon: '🔍',
        properties: {
          timeout: '30s'
        }
      },
      width: 180,
      height: 100
    },
    {
      id: 'node-3',
      type: 'default',
      position: { x: 500, y: 300 },
      data: {
        title: 'Resolve Ticket',
        icon: '✅',
        properties: {
          notifyUser: 'true'
        }
      },
      width: 180,
      height: 100
    }
  ],
  connections: [
    {
      id: 'conn-1',
      source: 'node-1',
      target: 'node-2',
      label: 'Ok'
    },
    {
      id: 'conn-2',
      source: 'node-2',
      target: 'node-3',
      label: 'Valid',
      type: 'success'
    }
  ],
  canvas: {
    zoom: 1,
    position: { x: 0, y: 0 },
    grid: true,
    snapToGrid: true
  }
};

type EditorMode = 'whiteboard' | 'flow';

export default function WhiteboardPage() {
  const [mode, setMode] = useState<EditorMode>('flow');

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Whiteboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Visual editor for your ideas and workflows</p>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              mode === 'whiteboard'
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            onClick={() => setMode('whiteboard')}
          >
            Sketch
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              mode === 'flow'
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            onClick={() => setMode('flow')}
          >
            Flow Editor
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-[calc(100vh-12rem)]">
        {mode === 'whiteboard' ? (
          <WhiteboardComponent />
        ) : (
          <FlowEditorComponent initialData={demoFlowData} />
        )}
      </div>
    </div>
  );
} 