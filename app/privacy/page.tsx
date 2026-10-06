import Link from 'next/link';
import { LegalDocument } from '@/components/LegalDocument';
import { PRIVACY_POLICY } from '@/lib/legal';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto p-4 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-text-muted hover:text-text transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-lg font-bold text-text flex-1 text-center pr-12">Privacy Policy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 pb-16 animate-on-scroll">
        <LegalDocument doc={PRIVACY_POLICY} />

        <Link
          href="/terms"
          className="mt-10 flex items-center justify-between rounded-xl border border-border p-4 font-medium text-text hover:border-primary transition-colors"
        >
          Terms &amp; Conditions
          <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
