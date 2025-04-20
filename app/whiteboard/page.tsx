import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to load the Excalidraw whiteboard component
const ExcalidrawWhiteboard = dynamic(
  () => import('../components/ExcalidrawWhiteboard'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }
);

export default function WhiteboardPage() {
  return <ExcalidrawWhiteboard />;
} 