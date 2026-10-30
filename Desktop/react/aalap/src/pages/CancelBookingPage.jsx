import { useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import BookingLookupForm from '../components/BookingLookupForm.jsx';
import {
  formatCurrency,
  formatDate,
  getCancellationPolicy,
  requestCancellation,
} from '../services/bookingService.js';

export default function CancelBookingPage() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [verifiedBooking, setVerifiedBooking] = useState(null);
  const [contactUsed, setContactUsed] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancellationResult, setCancellationResult] = useState(null);

  const policy = getCancellationPolicy();

  const handleLookupSuccess = (booking, contact) => {
    setVerifiedBooking(booking);
    setContactUsed(contact || booking.form.email || booking.form.phone);
    setCancellationResult(null);
  };

  const handleConfirmCancel = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const result = requestCancellation(verifiedBooking.id, contactUsed);
      setIsProcessing(false);
      setShowConfirmModal(false);
      setCancellationResult(result);
    }, 400);
  };

  return (
    <main className="min-h-screen bg-[#f7f5ef] pt-[76px]">
      {/* Header Banner */}
      <header className="bg-[#25251f] px-5 py-14 text-white sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1000px]">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d5b97f]">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link to="/check-booking" className="hover:underline">Guest Services</Link>
            <span>/</span>
            <span>Cancellation</span>
          </div>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Cancel Your Booking</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
            Need to cancel your stay? Retrieve your reservation and review its cancellation conditions before confirming.
          </p>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-[1000px] px-5 py-10 sm:px-8 sm:py-14">
        {!verifiedBooking ? (
          <div className="space-y-8">
            <BookingLookupForm
              initialBookingId={initialId}
              onSuccess={(booking) => handleLookupSuccess(booking)}
              submitButtonText="Find Booking to Cancel"
              actionType="cancel"
            />

            <div className="rounded-xl border border-[#e9e4d7] bg-white p-6">
              <h3 className="font-serif text-xl text-[#292821]">Hotel Cancellation Notice</h3>
              <p className="mt-2 text-xs leading-6 text-[#77746c]">
                Cancellations are governed by the hotel’s reservation terms. You will have an opportunity to review the reservation summary and applicable hotel conditions before confirming any cancellation request.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setVerifiedBooking(null);
                  setCancellationResult(null);
                }}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8b7242] transition-colors hover:text-[#292821]"
              >
                <span>← Look Up Another Reservation</span>
              </button>

              <Link
                to={`/check-booking?id=${encodeURIComponent(verifiedBooking.id)}`}
                className="text-xs text-[#77746c] hover:text-[#292821] hover:underline"
              >
                View Full Booking Details
              </Link>
            </div>

            {/* Cancellation Result Alert (if processed) */}
            {cancellationResult && !cancellationResult.success && (
              <div
                role="alert"
                className="rounded-xl border border-[#e5a8a1] bg-[#fff5f5] p-5 text-sm text-[#73271f] shadow-sm sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl" aria-hidden="true">⚠️</span>
                  <div>
                    <h3 className="font-semibold text-[#8b2318]">
                      Cancellation Request Could Not Be Processed
                    </h3>
                    <p className="mt-1 leading-6">{cancellationResult.message}</p>
                    <div className="mt-4 rounded-md border border-[#e5a8a1]/60 bg-white/70 p-3 text-xs leading-5">
                      <p>
                        <strong>Reservation Status Preserved:</strong>{' '}
                        <span className="font-semibold text-[#2d5027]">{verifiedBooking.status}</span>.
                        No change was made to your reservation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reservation Summary Card */}
            <article className="rounded-xl border border-[#e9e4d7] bg-white p-6 shadow-[0_12px_36px_rgba(39,35,26,0.07)] sm:p-8">
              <div className="flex flex-col justify-between gap-4 border-b border-[#eeeae1] pb-6 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b7242]">
                    Verified Reservation
                  </p>
                  <h2 className="mt-1 font-serif text-2xl text-[#292821]">
                    Reservation #{verifiedBooking.id}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#77746c]">Current Status:</span>
                  <span className="rounded-full border border-[#a8c79c] bg-[#2d5027] px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#ddffd6]">
                    {verifiedBooking.status}
                  </span>
                </div>
              </div>

              {/* Booking Info Grid */}
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[#77746c]">Guest Name</dt>
                    <dd className="font-medium text-[#292821]">{verifiedBooking.form.fullName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#77746c]">Room Category</dt>
                    <dd className="font-semibold text-[#8b7242]">{verifiedBooking.form.roomType}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#77746c]">Rooms Booked</dt>
                    <dd className="font-medium text-[#292821]">{verifiedBooking.pricing.roomCount}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#77746c]">Adults & Children</dt>
                    <dd className="font-medium text-[#292821]">
                      {verifiedBooking.form.adults} adults
                      {verifiedBooking.form.children > 0 ? `, ${verifiedBooking.form.children} children` : ''}
                    </dd>
                  </div>
                </dl>

                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[#77746c]">Check-in Date</dt>
                    <dd className="font-medium text-[#292821]">{formatDate(verifiedBooking.form.checkIn)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#77746c]">Check-out Date</dt>
                    <dd className="font-medium text-[#292821]">{formatDate(verifiedBooking.form.checkOut)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#77746c]">Total Booking Amount</dt>
                    <dd className="font-semibold text-[#8b7242]">
                      {formatCurrency(verifiedBooking.payment.total)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#77746c]">Payment Status</dt>
                    <dd className="font-medium text-[#292821]">{verifiedBooking.payment.status}</dd>
                  </div>
                </dl>
              </div>

              {/* Experiences Summary */}
              {verifiedBooking.pricing.activityRows && verifiedBooking.pricing.activityRows.length > 0 && (
                <div className="mt-6 border-t border-[#eeeae1] pt-4">
                  <p className="text-xs font-semibold text-[#292821]">Included Paid Experiences:</p>
                  <p className="mt-1 text-xs text-[#77746c]">
                    {verifiedBooking.pricing.activityRows.map((a) => a.name).join(', ')}
                  </p>
                </div>
              )}
            </article>

            {/* Cancellation Policy Section */}
            <section
              aria-labelledby="cancellation-policy-heading"
              className="rounded-xl border border-[#e8dfc7] bg-[#fbf9f2] p-6 sm:p-8"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl text-[#a88b53]" aria-hidden="true">📋</span>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b7242]">
                    Terms & Conditions
                  </p>
                  <h3 id="cancellation-policy-heading" className="mt-1 font-serif text-2xl text-[#292821]">
                    Hotel Cancellation Policy
                  </h3>

                  <div className="mt-4 space-y-3 text-xs leading-6 text-[#62583f]">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-[#e2ddd1] bg-white p-3.5">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#77746c]">
                          Eligibility Status
                        </span>
                        <span className="mt-1 block font-medium text-[#292821]">
                          Eligible for cancellation request
                        </span>
                      </div>

                      <div className="rounded-lg border border-[#e2ddd1] bg-white p-3.5">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#77746c]">
                          Applicable Deadline & Charges
                        </span>
                        <span className="mt-1 block font-medium text-[#8b7242]">
                          Policy unconfigured by hotel
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-[#e5dfce] bg-[#f4efe4] p-4 text-xs leading-5 text-[#544d3b]">
                      <p className="font-semibold text-[#292821]">Backend Policy Configuration Notice:</p>
                      <p className="mt-1">
                        {policy.message} As no automated cancellation fee percentage or deadline has been set, neither cancellation penalties nor automated refunds can be calculated by the browser.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setShowConfirmModal(true)}
                      className="rounded-md bg-[#a73e32] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#852c22] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a73e32]"
                    >
                      Cancel My Booking
                    </button>

                    <Link
                      to="/"
                      className="rounded-md border border-[#e2ddd1] bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#292821] transition-colors hover:bg-[#f7f5ef]"
                    >
                      Keep Reservation & Return Home
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Confirmation Dialog Modal */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg rounded-xl border border-[#e9e4d7] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fdf5f4] text-lg text-[#a73e32]">
                ⚠️
              </span>
              <div>
                <h3 id="modal-title" className="font-serif text-2xl text-[#292821]">
                  Confirm Cancellation Request
                </h3>
                <p className="text-xs text-[#77746c]">Reservation #{verifiedBooking.id}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-xs leading-6 text-[#62583f]">
              <p>
                Are you sure you want to request cancellation for this reservation for{' '}
                <strong className="text-[#292821]">{verifiedBooking.form.fullName}</strong> ({verifiedBooking.form.roomType}) from{' '}
                <strong>{formatDate(verifiedBooking.form.checkIn)}</strong> to{' '}
                <strong>{formatDate(verifiedBooking.form.checkOut)}</strong>?
              </p>

              <div className="rounded-md border border-[#e5dfce] bg-[#fbf9f2] p-3.5 text-xs text-[#665a3c]">
                <strong>Important:</strong> Cancellations require authorization from the hotel backend server. Once confirmed, this action cannot be undone.
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isProcessing}
                className="rounded-md border border-[#e2ddd1] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#62583f] transition-colors hover:bg-[#f7f5ef]"
              >
                Go Back / Keep Reservation
              </button>

              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isProcessing}
                className="rounded-md bg-[#a73e32] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#852c22] disabled:opacity-50"
              >
                {isProcessing ? 'Contacting Server...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
