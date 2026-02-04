
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">IMDb Movie App</h1>
      <p className="text-xl mb-4">Welcome to the advanced web applications project.</p>
      <div className="flex gap-4">
        <Link href="/movies" className="text-blue-500 hover:underline">Browse Movies</Link>
        <Link href="/search" className="text-blue-500 hover:underline">Search Movies</Link>
      </div>
    </main>
  );
}
