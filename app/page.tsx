'use client';

import { Suspense } from 'react';
import HomeContent from './home-content';

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
