'use client';

import { useRouter } from 'next/navigation';
import { usePrintJob } from '@/context/PrintJobContext';
import { ProgressBar } from '@/components/ProgressBar';
import { SessionTimer } from '@/components/SessionTimer';
import { useEffect, useState } from 'react';
import { createPaymentOrder, simulatePaymentSuccess, verifyPayment } from '@/lib/api/client';

export default function PaymentPage() {
  const router = useRouter();
  const { printJob, updatePayment, updateStatus } = usePrintJob();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!printJob.document.file) {
      router.push('/upload');
      return;
    }
    if (!printJob.printJobId) {
      router.push('/review');
    }
  }, [printJob.document.file, printJob.printJobId, router]);

  if (!printJob.document.file || !printJob.printJobId) {
    return null;
  }

  const loadRazorpayScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error('Could not load the payment window. Check your connection and try again.'));
      document.body.appendChild(script);
    });
  };

  /** Return the screen to a state where the customer can try again. */
  const stopProcessing = (message: string | null) => {
    setProcessing(false);
    setError(message);
    updatePayment({ status: 'pending' });
  };

  const handlePayment = async () => {
    if (!printJob.printJobId) {
      setError('This print job is no longer available. Please go back and set it up again.');
      return;
    }

    setProcessing(true);
    setError(null);
    updatePayment({ status: 'processing' });

    try {
      const order = await createPaymentOrder(printJob.printJobId);
      updatePayment({ orderId: order.orderId });

      const isRealKey = order.keyId.startsWith('rzp_');

      // Local development runs against a mock gateway, which has no checkout
      // window to open.
      if (!isRealKey) {
        const payment = await simulatePaymentSuccess(order.orderId);
        updatePayment({ paymentId: payment.paymentId });

        const verification = await verifyPayment({
          orderId: payment.orderId,
          paymentId: payment.paymentId,
          signature: payment.signature,
        });

        if (!verification.verified) {
          throw new Error('Payment could not be verified.');
        }

        updatePayment({ transactionId: verification.paymentId, status: 'success' });
        updateStatus('processing');
        setTimeout(() => router.push('/processing'), 500);
        return;
      }

      await loadRazorpayScript();

      const options = {
        key: order.keyId,
        // Razorpay expects paise. Rounding avoids float artifacts such as
        // 35.5 * 100 = 3550.0000000000005, which the gateway rejects as an
        // amount mismatch against the order it already holds.
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        order_id: order.orderId,
        name: 'MPrnt',
        description: `${printJob.pricing.totalPages} page${
          printJob.pricing.totalPages === 1 ? '' : 's'
        } · ${printJob.settings.colorMode === 'color' ? 'Colour' : 'Black & white'}`,
        theme: {
          // Brand green, so checkout does not look like a different website.
          color: '#226d45',
        },
        handler: async (response: any) => {
          updatePayment({ paymentId: response.razorpay_payment_id });

          try {
            const verification = await verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            if (!verification.verified) {
              throw new Error('Payment could not be verified.');
            }

            updatePayment({ transactionId: verification.paymentId, status: 'success' });
            updateStatus('processing');
            setTimeout(() => router.push('/processing'), 500);
          } catch (verifyError: any) {
            // The money has very likely been taken at this point, so the wording
            // must not tell someone their payment failed, and must not invite
            // them to pay a second time.
            setProcessing(false);
            updatePayment({ status: 'failed' });
            setError(
              'We could not confirm your payment. Please do not pay again — if you were ' +
                'charged, show this screen to the shop and they can sort it out.'
            );
            console.error('Payment verification failed', verifyError);
          }
        },
        modal: {
          // Razorpay's callback is `ondismiss`, not `onClose`. With the wrong
          // name nothing fired when the window was closed, so the button stayed
          // on "Processing Payment..." forever and a reload was the only escape.
          ondismiss: () => {
            stopProcessing(null);
          },
          // Ask before closing, so a mis-tap mid-payment does not drop the
          // customer out of checkout.
          confirm_close: true,
          escape: true,
        },
      };

      const razorpay = new (window as any).Razorpay(options);

      // A declined card or a failed UPI request emits this instead of calling
      // the handler. Without it the window just closes and nothing explains why.
      razorpay.on('payment.failed', (response: any) => {
        setProcessing(false);
        updatePayment({ status: 'failed' });
        setError(
          response?.error?.description ||
            'That payment did not go through. You can try again, or use a different method.'
        );
      });

      razorpay.open();
    } catch (err: any) {
      stopProcessing(err?.message || 'Something went wrong starting the payment. Please try again.');
      updatePayment({ status: 'failed' });
      console.error('Payment failed to start', err);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-surface/80 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.push('/review')}
              className="flex items-center gap-2 text-text-muted hover:text-text transition-colors disabled:opacity-50"
              disabled={processing}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <SessionTimer startTime={printJob.createdAt} />
          </div>
          <ProgressBar currentStep={5} totalSteps={5} />
          <div className="text-center mt-3">
            <h1 className="text-2xl font-bold text-text">Payment</h1>
            <p className="text-text-muted mt-0.5 text-sm">Step 5 of 5</p>
          </div>
        </div>
      </div>

      {/* Payment Area */}
      <div className="flex-1 p-4 overflow-y-auto pb-40">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Amount */}
          <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-8 text-center animate-on-scroll">
            <div className="text-sm text-text-muted mb-2">Total Amount</div>
            <div className="text-5xl font-black text-primary mb-2">₹{printJob.pricing.total}</div>
            <div className="text-sm text-text-muted">
              {printJob.pricing.totalPages} pages • {printJob.settings.copies}{' '}
              {printJob.settings.copies > 1 ? 'copies' : 'copy'}
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="bg-error/5 border-2 border-error/20 rounded-xl p-4 animate-on-scroll"
            >
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-error flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.71-3L13.71 4a2 2 0 00-3.42 0L3.36 16a2 2 0 001.71 3z"
                  />
                </svg>
                <p className="text-sm text-text">{error}</p>
              </div>
            </div>
          )}

          {/* What happens next.
              A UPI / Card / Wallet chooser used to sit here. It was removed:
              Razorpay's own window already offers all of those and more, the
              selection was never passed to the gateway, and it forced an extra
              tap that changed nothing about the payment. */}
          <div className="animate-on-scroll" style={{ animationDelay: '0.05s' }}>
            <div className="bg-surface-secondary border border-border rounded-xl p-6">
              <h2 className="text-lg font-bold text-text mb-3">How payment works</h2>
              <ol className="space-y-3 text-sm text-text-muted">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    1
                  </span>
                  <span>
                    Tap{' '}
                    <span className="font-semibold text-text">Pay ₹{printJob.pricing.total}</span> to
                    open the secure payment window.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    2
                  </span>
                  <span>Choose UPI, card, net banking or a wallet — whichever you prefer.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    3
                  </span>
                  <span>Your document prints as soon as the payment is confirmed.</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Security */}
          <div
            className="bg-success/5 border border-success/20 rounded-xl p-6 animate-on-scroll"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text mb-1">Secure Payment</h3>
                <p className="text-sm text-text-muted">
                  Payments are handled by Razorpay. We never see or store your card or UPI details.
                </p>
              </div>
            </div>
          </div>

          {/* Session Info */}
          <div
            className="text-center text-sm text-text-muted animate-on-scroll"
            style={{ animationDelay: '0.15s' }}
          >
            <p>Backend Session: {printJob.backendSessionId || printJob.sessionId}</p>
            <p className="mt-1">Kiosk: {printJob.kioskId}</p>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handlePayment}
            disabled={processing}
            className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            {processing ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Opening payment…
              </>
            ) : (
              <>
                Pay ₹{printJob.pricing.total}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
