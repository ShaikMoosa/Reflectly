"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TestSubscription() {
  const [status, setStatus] = useState("Not started");
  const [error, setError] = useState<string | null>(null);

  // Function to test the redirect
  const testRedirect = async () => {
    try {
      setStatus("Testing redirect...");
      
      // Using fetch to make a request to the subscription endpoint
      const response = await fetch("/api/subscription");
      
      // If the response is a redirect (3xx), it's working
      if (response.redirected) {
        setStatus("Success: Redirect detected");
        window.location.href = response.url; // Actually follow the redirect
      } else {
        // If no redirect occurred, get the response body
        const data = await response.json();
        setStatus(`Failed: No redirect (Status: ${response.status})`);
        setError(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setStatus("Error occurred");
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Test Subscription Redirect</h1>
      
      <div className="mb-4">
        <div className="font-medium mb-1">Status:</div>
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">{status}</div>
      </div>
      
      {error && (
        <div className="mb-4">
          <div className="font-medium mb-1 text-red-500">Error:</div>
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded overflow-auto max-h-40">
            <pre className="text-xs">{error}</pre>
          </div>
        </div>
      )}
      
      <div className="flex space-x-4">
        <button 
          onClick={testRedirect} 
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Test Redirect
        </button>
        
        <Link 
          href="/api/subscription" 
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
        >
          Direct Link
        </Link>
      </div>
      
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        <p>This page tests the subscription redirect functionality.</p>
        <p className="mt-2">If the redirect works properly, you should be redirected to the Lemon Squeezy checkout page with your user ID included in the URL parameters.</p>
      </div>
    </div>
  );
} 