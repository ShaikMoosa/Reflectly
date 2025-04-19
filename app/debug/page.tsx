'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Debug page for isolated testing of components
export default function DebugPage() {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isConsoleOverridden, setIsConsoleOverridden] = useState(false);

  // Override console.log to capture logs
  useEffect(() => {
    if (isConsoleOverridden) return;

    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.log = (...args) => {
      const logEntry = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
      ).join(' ');
      
      setLogs(prev => [...prev, `[LOG] ${logEntry}`]);
      originalConsoleLog(...args);
    };

    console.error = (...args) => {
      const logEntry = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
      ).join(' ');
      
      setLogs(prev => [...prev, `[ERROR] ${logEntry}`]);
      originalConsoleError(...args);
    };

    console.warn = (...args) => {
      const logEntry = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
      ).join(' ');
      
      setLogs(prev => [...prev, `[WARN] ${logEntry}`]);
      originalConsoleWarn(...args);
    };

    setIsConsoleOverridden(true);

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, [isConsoleOverridden]);

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <header className="bg-base-200 p-4 shadow-md">
        <h1 className="text-xl font-bold">Reflectly Debug Page</h1>
        <p className="text-sm opacity-70">Use this page to isolate and debug component issues</p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Component selector sidebar */}
        <aside className="w-64 bg-base-200 p-4 overflow-y-auto">
          <h2 className="font-bold mb-4">Component Tests</h2>
          
          <div className="space-y-2">
            <button
              className={`btn btn-sm w-full ${activeTest === 'whiteboard' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTest('whiteboard')}
            >
              TLDraw Whiteboard
            </button>
            <button
              className={`btn btn-sm w-full ${activeTest === 'network' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTest('network')}
            >
              Network Diagnostics
            </button>
            <button
              className={`btn btn-sm w-full ${activeTest === 'system' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTest('system')}
            >
              System Info
            </button>
          </div>

          <div className="mt-8">
            <button className="btn btn-sm btn-error w-full" onClick={clearLogs}>
              Clear Logs
            </button>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 flex flex-col">
          {/* Component test area */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activeTest === 'whiteboard' ? (
              <WhiteboardTest />
            ) : activeTest === 'network' ? (
              <NetworkTest />
            ) : activeTest === 'system' ? (
              <SystemInfoTest />
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <h2 className="text-xl font-bold mb-4">Select a Component Test</h2>
                  <p>Choose a component from the sidebar to begin testing</p>
                </div>
              </div>
            )}
          </div>

          {/* Console output */}
          <div className="h-48 bg-base-300 p-4 overflow-y-auto font-mono text-sm">
            <div className="flex justify-between mb-2">
              <h3 className="font-bold">Console Output</h3>
              <button className="text-xs opacity-70" onClick={clearLogs}>Clear</button>
            </div>
            {logs.length === 0 ? (
              <p className="opacity-50">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div 
                  key={index} 
                  className={`mb-1 ${
                    log.startsWith('[ERROR]') 
                      ? 'text-error' 
                      : log.startsWith('[WARN]')
                      ? 'text-warning'
                      : ''
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Lazy load the Excalidraw component to test it in isolation
const LazyExcalidrawWhiteboard = dynamic(
  () => import('../components/ExcalidrawWhiteboard'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Loading Whiteboard Component...</p>
        </div>
      </div>
    )
  }
);

// Whiteboard test component
function WhiteboardTest() {
  console.log('[DEBUG] Excalidraw Whiteboard component mounted');
  
  return (
    <div className="card bg-base-200 shadow-xl h-[500px]">
      <div className="card-body p-4">
        <h2 className="card-title">Excalidraw Whiteboard Test</h2>
        <p className="text-sm mb-4">Testing isolated whiteboard component</p>
        <div className="h-full">
          <LazyExcalidrawWhiteboard />
        </div>
      </div>
    </div>
  );
}

// Network diagnostics component
function NetworkTest() {
  const [status, setStatus] = useState<{[key: string]: string}>({});
  
  useEffect(() => {
    async function checkEndpoints() {
      console.log('[DEBUG] Running network diagnostics');
      
      const endpoints = [
        { name: 'Next.js API', url: '/api/health' },
        { name: 'localhost:3000', url: 'http://localhost:3000' },
        { name: 'CDN Assets', url: '/_next/static/chunks/main.js' },
      ];
      
      const results: {[key: string]: string} = {};
      
      for (const endpoint of endpoints) {
        try {
          console.log(`[DEBUG] Testing endpoint: ${endpoint.name}`);
          
          const startTime = performance.now();
          const response = await fetch(endpoint.url, { 
            method: 'HEAD',
            // Avoid CORS issues with same-origin policy
            mode: endpoint.url.startsWith('/') ? 'same-origin' : 'no-cors',
          });
          const endTime = performance.now();
          
          const latency = Math.round(endTime - startTime);
          results[endpoint.name] = `✅ ${response.ok ? 'OK' : 'Reachable'} (${latency}ms)`;
          
          console.log(`[DEBUG] Endpoint ${endpoint.name} is reachable, latency: ${latency}ms`);
        } catch (error) {
          console.error(`[DEBUG] Error checking endpoint ${endpoint.name}:`, error);
          results[endpoint.name] = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      }
      
      setStatus(results);
    }
    
    checkEndpoints();
  }, []);
  
  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Network Diagnostics</h2>
        <p className="text-sm mb-4">Testing network connectivity to required resources</p>
        
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Endpoint</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(status).map(([endpoint, result]) => (
                <tr key={endpoint}>
                  <td>{endpoint}</td>
                  <td className={result.includes('❌') ? 'text-error' : 'text-success'}>
                    {result}
                  </td>
                </tr>
              ))}
              {Object.keys(status).length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center">
                    <div className="loading loading-spinner loading-sm"></div> Running diagnostics...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// System information component
function SystemInfoTest() {
  const [info, setInfo] = useState<{[key: string]: string}>({});
  
  useEffect(() => {
    function gatherSystemInfo() {
      console.log('[DEBUG] Gathering system information');
      
      const systemInfo: {[key: string]: string} = {
        'User Agent': navigator.userAgent,
        'Window Size': `${window.innerWidth}x${window.innerHeight}`,
        'Device Pixel Ratio': window.devicePixelRatio.toString(),
        'Language': navigator.language,
        'Color Scheme': window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light',
        'Next.js Version': (window as any).__NEXT_DATA__?.buildId || 'Unknown',
        'React Version': React.version,
      };
      
      // Check memory if available
      if ('memory' in navigator) {
        const memoryInfo = (navigator as any).memory;
        systemInfo['Total JS Heap'] = formatBytes(memoryInfo.totalJSHeapSize);
        systemInfo['JS Heap Limit'] = formatBytes(memoryInfo.jsHeapSizeLimit);
      }
      
      // Check for WebGL capabilities
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            systemInfo['GPU Vendor'] = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            systemInfo['GPU Renderer'] = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          }
        }
      } catch (e) {
        console.error('[DEBUG] Error checking WebGL:', e);
        systemInfo['WebGL'] = 'Error checking';
      }
      
      setInfo(systemInfo);
      console.log('[DEBUG] System information:', systemInfo);
    }
    
    gatherSystemInfo();
  }, []);
  
  // Helper to format bytes
  function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }
  
  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">System Information</h2>
        <p className="text-sm mb-4">Gathering system details to help with debugging</p>
        
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(info).map(([property, value]) => (
                <tr key={property}>
                  <td>{property}</td>
                  <td className="font-mono text-sm">{value}</td>
                </tr>
              ))}
              {Object.keys(info).length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center">
                    <div className="loading loading-spinner loading-sm"></div> Gathering information...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 