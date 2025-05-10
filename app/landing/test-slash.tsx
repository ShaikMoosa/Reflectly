import Link from 'next/link';

export default function TestSlashPage() {
  return (
    <div>
      <h1>Test Slash Page</h1>
      {/* Deliberately using trailing slash to test */}
      <Link href="/contact/">Contact with trailing slash</Link>
    </div>
  );
} 