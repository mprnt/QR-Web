'use client';

import { useRouter } from 'next/navigation';
import { usePrintJob } from '@/context/PrintJobContext';
import { ProgressBar } from '@/components/ProgressBar';
import { SessionTimer } from '@/components/SessionTimer';
import { OptionCard } from '@/components/OptionCard';
import { useEffect, useState } from 'react';
import { createPaymentOrder, simulatePaymentSuccess, verifyPayment } from '@/lib/api/client';

export default function PaymentPage() {
  const router = useRouter();
  const { printJob, updatePayment, updateStatus } = usePrintJob();
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'wallet' | null>(null);
  const [processing, setProcessing] = useState(false);

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
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }

    if (!printJob.printJobId) {
      alert('Print job not created. Please go back.');
      return;
    }

    setProcessing(true);
    updatePayment({ method: selectedMethod, status: 'processing' });

    try {
      const order = await createPaymentOrder(printJob.printJobId);
      console.log('✓ Payment order created:', order.orderId);
      updatePayment({ orderId: order.orderId });

      const isRealKey = order.keyId.startsWith('rzp_');

      if (!isRealKey) {
        console.log('Using mock payment flow (dev mode)');
        const payment = await simulatePaymentSuccess(order.orderId);

        console.log('✓ Payment simulated:', payment.paymentId);
        updatePayment({ paymentId: payment.paymentId });

        const verification = await verifyPayment({
          orderId: payment.orderId,
          paymentId: payment.paymentId,
          signature: payment.signature,
        });

        if (verification.verified) {
          updatePayment({
            transactionId: verification.paymentId,
            status: 'success',
          });
          updateStatus('processing');

          setTimeout(() => {
            router.push('/processing');
          }, 500);
        } else {
          throw new Error('Payment verification failed');
        }
        return;
      }

      await loadRazorpayScript();

      const options = {
        key: order.keyId,
        amount: order.amount * 100,
        currency: order.currency,
        order_id: order.orderId,
        name: 'MPrnt',
        description: 'Print payment',
        handler: async (response: any) => {
          console.log('✓ Payment success:', response.razorpay_payment_id);
          updatePayment({ paymentId: response.razorpay_payment_id });

          try {
            const verification = await verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            console.log('✓ Payment verified and captured!');

            if (verification.verified) {
              updatePayment({
                transactionId: verification.paymentId,
                status: 'success',
              });
              updateStatus('processing');

              setTimeout(() => {
                router.push('/processing');
              }, 500);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (verifyError: any) {
            console.error('Payment verification failed:', verifyError);
            alert('Payment verification failed: ' + (verifyError.message || 'Unknown error'));
            updatePayment({ status: 'failed' });
            setProcessing(false);
          }
        },
        modal: {
          onClose: () => {
            setProcessing(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment failed:', error);
      alert('Payment failed: ' + (error.message || 'Unknown error'));
      updatePayment({ status: 'failed' });
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/review')}
              className="flex items-center gap-2 text-text-muted hover:text-text"
              disabled={processing}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <SessionTimer startTime={printJob.createdAt} />
          </div>
          <ProgressBar currentStep={5} totalSteps={5} />
          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold text-text">Payment</h1>
            <p className="text-text-muted mt-1">Step 5 of 5</p>
          </div>
        </div>
      </div>

      {/* Payment Area */}
      <div className="flex-1 p-4 overflow-y-auto pb-40">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Amount Display */}
          <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-8 text-center animate-on-scroll">
            <div className="text-sm text-text-muted mb-2">Total Amount</div>
            <div className="text-5xl font-black text-primary mb-2">₹{printJob.pricing.total}</div>
            <div className="text-sm text-text-muted">
              {printJob.pricing.totalPages} pages • {printJob.settings.copies} {printJob.settings.copies > 1 ? 'copies' : 'copy'}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="animate-on-scroll" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-lg font-bold text-text mb-4">Select Payment Method</h2>
            <div className="space-y-4">
              <OptionCard
                icon={
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                }
                title="UPI"
                description="Pay via Google Pay, PhonePe, Paytm"
                selected={selectedMethod === 'upi'}
                onClick={() => setSelectedMethod('upi')}
              />
              <OptionCard
                icon={
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                }
                title="Card"
                description="Debit / Credit / ATM Card"
                selected={selectedMethod === 'card'}
                onClick={() => setSelectedMethod('card')}
              />
              <OptionCard
                icon={
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                }
                title="Wallet"
                description="Paytm, MobiKwik, Amazon Pay"
                selected={selectedMethod === 'wallet'}
                onClick={() => setSelectedMethod('wallet')}
              />
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-success/5 border border-success/20 rounded-xl p-6 animate-on-scroll" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text mb-1">Secure Payment</h3>
                <p className="text-sm text-text-muted">
                  Your payment is encrypted and secure. We do not store your card or UPI details.
                </p>
              </div>
            </div>
          </div>

          {/* Session Info */}
          <div className="text-center text-sm text-text-muted animate-on-scroll" style={{ animationDelay: '0.3s' }}>
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
            disabled={!selectedMethod || processing}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Payment...
              </>
            ) : (
              <>
                Pay ₹{printJob.pricing.total}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </>
            )}
          </button>
          {!selectedMethod && (
            <p className="text-center text-sm text-text-muted mt-2">
              Please select a payment method
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
