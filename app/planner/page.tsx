import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { getPlannerData, PlannerData } from './actions'; 
import PlannerBoard from './components/planner-board'; // Corrected anticipated path
import { Skeleton } from '../components/ui/skeleton'; // Corrected path for shadcn ui

export default async function PlannerPage() {
  // Check authentication server-side
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch initial data
  // Error handling is basic here; consider more robust error boundaries
  let initialData: PlannerData = { columns: [] };
  try {
    initialData = await getPlannerData();
  } catch (error) {
    console.error("Failed to load planner data:", error);
    // Render an error state or fallback UI
    return (
      <div className="p-4 text-red-600">
        Failed to load planner data. Please try again later.
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-4">My Planner</h1>
      {/* 
        Pass initial data to the client component. 
        The client component will handle UI interactions and call server actions.
      */}
      <Suspense fallback={<PlannerSkeleton />}>
         {/* 
           We pass the server actions directly as props. 
           This avoids needing separate API routes for simple cases.
         */}
         <PlannerBoard initialData={initialData} />
      </Suspense>
    </div>
  );
}

// Basic skeleton loader
function PlannerSkeleton() {
  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-72 flex-shrink-0 bg-muted rounded-lg p-3">
          <Skeleton className="h-6 w-3/4 mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Skeleton className="h-8 w-full mt-3" />
        </div>
      ))}
      <div className="w-72 flex-shrink-0">
         <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
} 