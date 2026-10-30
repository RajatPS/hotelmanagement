import { useState } from 'react';
import { verifyAndGetBooking } from '../services/bookingService.js';

const inputClass = 'mt-2 w-full rounded-md border border-[#e2ddd1] bg-white px-3.5 py-3 text-sm text-[#292821] outline-none transition focus:border-[#a88b53] focus:ring-2 focus:ring-[#a88b53]/15';
const fieldLabelClass = 'block text-sm font-medium text-[#39372f]';

export default function BookingLookupForm({
  initialBookingId = '',
  onSuccess,
  submitButtonText = 'Find My Booking',
  actionType = 'check',
}) {
  const [bookingId, setBookingId] = useState(initialBookingId);
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!bookingId.trim()) {
      setError('Please enter your Booking ID / Reservation Number.');
      return;
    }

    if (!contact.trim()) {
      setError('Please enter your registered email address or phone number.');
      return;
    }

    setIsLoading(true);

    // Simulate standard lookup response timing
    setTimeout(() => {
      const result = verifyAndGetBooking(bookingId, contact);
      setIsLoading(false);

      if (!result.success) {
        setError(result.message);
      } else {
        if (onSuccess) {
          onSuccess(result.booking);
        }
      }
    }, 250);
  };

  return (
    <div className="rounded-xl border border-[#e9e4d7] bg-white p-6 shadow-[0_12px_36px_rgba(39,35,26,0.07)] sm:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-[#eeeae1] pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b7242]">
            {actionType === 'cancel' ? 'Reservation Verification' : 'Guest Self-Service'}
          </p>
          <h2 className="mt-1 font-serif text-2xl text-[#292821]">
            {actionType === 'cancel' ? 'Locate Reservation to Cancel' : 'Retrieve Your Reservation'}
          </h2>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-[#e8dfc7] bg-[#fbf9f2] p-4 text-xs leading-5 text-[#62583f]">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 text-base text-[#a88b53]" aria-hidden="true">🔒</span>
          <div>
            <strong className="font-semibold text-[#292821]">Security & Verification Notice:</strong>
            <p className="mt-1">
              Backend two-factor OTP (SMS/Email) gateway is currently not configured on the hotel server. To safeguard your privacy, booking details are only revealed when the Booking ID matches your registered contact information.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="booking-id-input" className={fieldLabelClass}>
            Booking ID / Reservation Number
          </label>
          <input
            id="booking-id-input"
            type="text"
            placeholder="e.g. MH-20261030-XXXX"
            value={bookingId}
            onChange={(e) => {
              setBookingId(e.target.value);
              setError('');
            }}
            required
            className={inputClass}
          />
          <p className="mt-1 text-xs text-[#77746c]">
            Found on your booking voucher or confirmation screen.
          </p>
        </div>

        <div>
          <label htmlFor="contact-input" className={fieldLabelClass}>
            Registered Email Address or Phone Number
          </label>
          <input
            id="contact-input"
            type="text"
            placeholder="you@example.com or registered phone"
            value={contact}
            onChange={(e) => {
              setContact(e.target.value);
              setError('');
            }}
            required
            className={inputClass}
          />
          <p className="mt-1 text-xs text-[#77746c]">
            Enter the exact contact details used when reserving your stay.
          </p>
        </div>

        {error && (
          <div role="alert" className="rounded-md border border-[#e5c5c1] bg-[#fdf5f4] p-3.5 text-sm text-[#a73e32]">
            <div className="flex items-start gap-2">
              <span className="font-bold">✕</span>
              <p>{error}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-[#292821] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#a88b53] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a88b53] disabled:opacity-50 sm:w-auto"
        >
          {isLoading ? 'Verifying Details...' : submitButtonText}
        </button>
      </form>
    </div>
  );
}
