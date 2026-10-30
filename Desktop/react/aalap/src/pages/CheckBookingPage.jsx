import { useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import BookingLookupForm from '../components/BookingLookupForm.jsx';
import BookingDetailsCard from '../components/BookingDetailsCard.jsx';

export default function CheckBookingPage() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [retrievedBooking, setRetrievedBooking] = useState(null);

  return (
    <main className="min-h-screen bg-[#f7f5ef] pt-[76px]">
      {/* Header Banner */}
      <header className="bg-[#25251f] px-5 py-14 text-white sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1000px]">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d5b97f]">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Guest Services</span>
          </div>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Check Your Booking</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
            Already booked with My Hotel? Enter your reservation details to view your booking confirmation and stay information.
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="mx-auto max-w-[1000px] px-5 py-10 sm:px-8 sm:py-14">
        {retrievedBooking ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setRetrievedBooking(null)}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8b7242] transition-colors hover:text-[#292821]"
              >
                <span>← Back to Lookup</span>
              </button>

              <Link
                to="/"
                className="text-xs text-[#77746c] hover:text-[#292821] hover:underline"
              >
                Return to Homepage
              </Link>
            </div>

            <BookingDetailsCard
              booking={retrievedBooking}
              onReset={() => setRetrievedBooking(null)}
              showCancelAction={true}
            />
          </div>
        ) : (
          <div className="space-y-8">
            <BookingLookupForm
              initialBookingId={initialId}
              onSuccess={(booking) => setRetrievedBooking(booking)}
              submitButtonText="Find My Booking"
              actionType="check"
            />

            {/* Helpful Navigation & Information Cards */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-[#e9e4d7] bg-white p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b7242]">
                  New Reservation
                </p>
                <h3 className="mt-2 font-serif text-xl text-[#292821]">Haven’t Booked Yet?</h3>
                <p className="mt-2 text-xs leading-5 text-[#77746c]">
                  Experience comfort and luxury in our thoughtfully designed rooms and exciting outdoor adventures.
                </p>
                <Link
                  to="/booking"
                  className="mt-4 inline-block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8b7242] transition-colors hover:text-[#292821]"
                >
                  Book Your Stay Now →
                </Link>
              </div>

              <div className="rounded-xl border border-[#e9e4d7] bg-white p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a73e32]">
                  Reservation Changes
                </p>
                <h3 className="mt-2 font-serif text-xl text-[#292821]">Need to Cancel?</h3>
                <p className="mt-2 text-xs leading-5 text-[#77746c]">
                  Plans changed? You can review your cancellation conditions and request a cancellation securely.
                </p>
                <Link
                  to="/cancel-booking"
                  className="mt-4 inline-block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a73e32] transition-colors hover:text-[#292821]"
                >
                  Go to Cancel Booking →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
