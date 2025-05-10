import { ReactNode } from 'react';

export default function WhiteboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
} 