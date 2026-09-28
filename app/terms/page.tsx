'use client';

import Link from 'next/link';

export default function TermsPage() {
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
          <h1 className="text-lg font-bold text-text flex-1 text-center pr-12">Terms & Conditions</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 pb-16">
        <div className="space-y-8 animate-on-scroll">
          {/* Last updated */}
          <p className="text-sm text-text-muted">Last updated: September 28, 2026</p>

          {/* Introduction */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text">1. Introduction</h2>
            <p className="text-text-muted leading-relaxed">
              Welcome to MPrnt (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms and Conditions
              (&quot;Terms&quot;) govern your use of our self-service printing kiosk platform and related
              services (collectively, the &quot;Service&quot;). By accessing or using our Service,
              you agree to be bound by these Terms. If you do not agree with any part of these
              Terms, you may not use our Service.
            </p>
          </section>

          {/* Service Description */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text">2. Service Description</h2>
            <p className="text-text-muted leading-relaxed">
              MPrnt provides a self-service document printing platform that allows users to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-text-muted">
              <li>Upload documents (PDF, PNG, JPEG formats) via a mobile-friendly web interface</li>
              <li>Configure print settings including color mode, paper size, orientation, and number of copies</li>
              <li>Make secure online payments via UPI, debit/credit cards, or digital wallets</li>
              <li>Retrieve printed documents from designated kiosk output trays</li>
            </ul>
          </section>

          {/* User Responsibilities */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text">3. User Responsibilities</h2>
            <p className="text-text-muted leading-relaxed">
              By using our Service, you agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-text-muted">
              <li>You will only upload and print documents that you have the legal right to reproduce</li>
              <li>You will not use the Service to print illegal, obscene, defamatory, or otherwise objectionable content</li>
              <li>You are responsible for collecting your printed documents promptly from the kiosk</li>
              <li>You will not attempt to tamper with, damage, or interfere with the operation of any kiosk</li>
              <li>You provide accurate information during the payment process</li>
            </ul>
          </section>

          {/* Pricing and Payment */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text">4. Pricing & Payment</h2>
            <p className="text-text-muted leading-relaxed">
              Pricing is calculated based on the number of pages, color mode, and number of copies selected.
              Current rates are displayed during the print configuration process. All prices are in Indian
              Rupees (₹) and inclusive of applicable taxes.
            </p>
            <p className="text-text-muted leading-relaxed">
              Payments are processed securely through our payment gateway partner. We do not store your
              card details, UPI IDs, or any sensitive payment information on our servers. Once a payment
              is confirmed and printing has begun, refunds will only be issued in case of a service failure
              on our end.
            </p>
          </section>

          {/* Session Policy */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text">5. Session Policy</h2>
            <p className="text-text-muted leading-relaxed">
              Each print session is valid for 10 minutes from the time of QR code scan. If a session
              expires before payment is completed, you will need to start a new session. Uploaded
              documents are automatically deleted from our servers after the session expires or the
              print job is completed, whichever comes first.
            </p>
          </section>

          {/* Document Handling */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text">6. Document Handling & Privacy</h2>
            <p className="text-text-muted leading-relaxed">
              Your uploaded documents are transmitted securely using encrypted connections.
              Documents are stored temporarily on our servers solely for the purpose of processing
              your print job. We do not access, read, or share the content of your documents.
              All uploaded files are permanently deleted within 24 hours of upload or upon session
              completion.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text">7. Limitation of Liability</h2>
            <p className="text-text-muted leading-relaxed">
              To the maximum extent permitted by applicable law, MPrnt shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages resulting from your
              use of or inability to use the Service. Our total liability shall not exceed the amount
              paid by you for the specific transaction that gave rise to the claim.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text">8. Intellectual Property</h2>
            <p className="text-text-muted leading-relaxed">
              The MPrnt name, logo, and all associated branding are the property of MPrnt.
              You may not use our intellectual property without prior written consent.
              You retain all rights to the documents you upload for printing.
            </p>
          </section>

          {/* Modifications */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text">9. Modifications to Terms</h2>
            <p className="text-text-muted leading-relaxed">
              We reserve the right to modify these Terms at any time. Changes will be effective
              immediately upon posting on our platform. Your continued use of the Service after
              any modifications constitutes your acceptance of the revised Terms. We encourage
              you to review these Terms periodically.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text">10. Contact Us</h2>
            <p className="text-text-muted leading-relaxed">
              If you have any questions, concerns, or feedback about these Terms or our Service,
              please contact us at:
            </p>
            <div className="bg-surface-secondary rounded-xl p-4 space-y-1">
              <p className="text-text font-medium">MPrnt Support</p>
              <p className="text-text-muted text-sm">Email: support@mprnt.in</p>
              <p className="text-text-muted text-sm">Phone: +91-XXXXX-XXXXX</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
