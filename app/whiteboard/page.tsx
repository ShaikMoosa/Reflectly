import { Metadata } from 'next';
import { WhiteboardCanvas } from '@/app/whiteboard/components/WhiteboardCanvas';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Whiteboard | Reflectly',
  description: 'Interactive whiteboard for creative work',
};

export default function WhiteboardPage() {
  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-white dark:bg-gray-900">
      <div className="p-4 flex items-center">
        <Link href="/" className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-2xl font-bold text-center flex-1 mr-20">Whiteboard</h1>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <WhiteboardCanvas />
      </div>
    </div>
  );
} 