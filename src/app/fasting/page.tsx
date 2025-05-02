'use client';

import FastingTracker from '@/components/fasting/fasting-tracker';

export default function FastingPage() {
  return (
    <div className="container mx-auto max-w-md p-4 pb-20">
      <h1 className="mb-6 text-center text-2xl font-bold">
        Intermittent Fasting
      </h1>
      <FastingTracker />
    </div>
  );
}
