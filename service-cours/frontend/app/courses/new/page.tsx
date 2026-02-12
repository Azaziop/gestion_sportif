'use client';

import Link from 'next/link';
import { CourseForm } from '@/components/course-form';
import { Button } from '@/components/ui/button';

export default function NewCoursePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/">
            <Button variant="outline">← Retour</Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Nouveau Cours</h1>
        </div>

        {/* Form */}
        <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
          <CourseForm />
        </div>
      </div>
    </div>
  );
}
