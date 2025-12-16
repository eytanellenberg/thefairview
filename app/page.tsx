```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">FAIR Engine — Demo</h1>
        <p className="text-gray-400 max-w-md mx-auto">
          Live FAIR engine under calibration. Explore the sports demo.
        </p>
        <Link
          href="/sports"
          className="inline-block px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition"
        >
          Open Sports Demo
        </Link>
      </div>
    </main>
  );
}
