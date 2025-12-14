'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center text-blue-600">
            <ArrowLeft className="w-5 h-5 mr-2" />Back
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">About TheFairView</h1>
        <p className="text-xl text-gray-600 mb-8">Causal attribution science for sport analytics</p>
        
        <div className="bg-white rounded-xl p-8 card-shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">The FAIR Methodology</h2>
          <p className="text-gray-700 mb-4">
            FAIR (Fair Attribution of Integrated Risks) is a peer-reviewed causal framework
            adapted from epidemiology to elite sport.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded p-6 mb-4">
            <h3 className="font-bold mb-2">RAI - Readiness Attribution Index</h3>
            <p className="text-gray-700">Pre-match prediction integrating individual, team, and opponent factors</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded p-6">
            <h3 className="font-bold mb-2">PAI - Performance Attribution Index</h3>
            <p className="text-gray-700">Post-match causal decomposition of what drove performance</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 card-shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">Fair Research Organization</h2>
          <p className="text-gray-700 mb-4">
            <strong>Founder:</strong> Dr. Eytan Ellenberg, MD MPH PhD
          </p>
          <p className="text-gray-700 mb-4">
            Physician-epidemiologist with expertise in causal attribution across healthcare,
            actuarial science, and sport analytics.
          </p>
          <a href="mailto:eytan_ellenberg@yahoo.fr" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg">
            Contact Us
          </a>
        </div>
      </main>
    </div>
  );
}
