"use client";

import Link from "next/link";

function MotionFigure() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      className="ml-3 text-gray-500 motion-figure"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* head */}
      <circle cx="24" cy="9" r="4" fill="currentColor" />
      {/* body */}
      <path
        d="M24 14 L22 26 L16 36 M24 26 L30 36 M22 18 L14 22 M26 18 L34 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="p-6 max-w-4xl mx-auto text-gray-900 bg-white">
      {/* TITLE */}
      <div className="flex items-center mb-4">
        <h1 className="text-3xl font-semibold">
          The Fair View
        </h1>
        <MotionFigure />
      </div>

      <p className="text-base text-gray-700 mb-6">
        FAIR applies causal reasoning to sports analysis.
        <br />
        Not predictive. Comparative. Match-based.
      </p>

      {/* HOW IT WORKS */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">
          How it works
        </h2>
        <ul className="list-disc ml-6 text-sm text-gray-700">
          <li>
            <strong>RAI</strong> — what was structurally expected before the game
          </li>
          <li>
            <strong>Levers</strong> — where the comparative edge was
          </li>
          <li>
            <strong>PAI</strong> — what actually decided the game
          </li>
        </ul>
        <p className="text-sm text-gray-600 mt-2">
          This is a causal framework, not a prediction model.
        </p>
      </div>

      {/* LIVE SPORTS */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">
          Live sports
        </h2>
        <div className="flex flex-col gap-2">
          <Link
            href="/nba"
            className="border rounded p-3 hover:bg-gray-50"
          >
            NBA — last game analysis (FREE)
          </Link>

          <Link
            href="/nfl"
            className="border rounded p-3 hover:bg-gray-50"
          >
            NFL — last game analysis (FREE)
          </Link>
        </div>
      </div>

      {/* ANALYSTS */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">
          For analysts & clubs
        </h2>
        <p className="text-sm text-gray-700">
          Analyses can become significantly more precise when internal team data
          are integrated: expanded levers, deeper pre-game modeling, and
          customized causal attribution.
        </p>
        <p className="text-sm text-gray-700 mt-2">
          Contact: <strong>eytan_ellenberg@yahoo.fr</strong>
        </p>
      </div>

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative
      </footer>

      {/* subtle motion */}
      <style jsx>{`
        .motion-figure {
          animation: drift 4.5s ease-in-out infinite;
        }

        @keyframes drift {
          0% {
            transform: translateY(0);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-3px);
            opacity: 0.9;
          }
          100% {
            transform: translateY(0);
            opacity: 0.7;
          }
        }
      `}</style>
    </main>
  );
}
