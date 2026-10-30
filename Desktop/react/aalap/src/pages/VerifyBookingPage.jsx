import { useSearchParams, Link } from 'react-router';
import { getBookingById, maskName, formatDate } from '../services/bookingService.js';

export default function VerifyBookingPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('id') || '';

  const booking = bookingId ? getBookingById(bookingId) : null;

  return (
    <main className="min-h-screen bg-[#f7f5ef] pt-[76px]">
      <header className="bg-[#25251f] px-5 py-12 text-white sm:px-8 sm:py-16">
        <div className="mx-auto max-w-[800px] text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d5b97f]">
            Reservation Authenticity Verification
          </p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl">My Hotel · Digital Registry</h1>
        </div>
      </header>

      <div className="mx-auto max-w-[700px] px-5 py-10 sm:px-8 sm:py-14">
        {booking ? (
          <div className="overflow-hidden rounded-xl border border-[#e9e4d7] bg-white shadow-[0_12px_36px_rgba(39,35,26,0.07)]">
            <div className="border-b border-[#eeeae1] bg-[#fbf9f2] p-6 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#e8dfc7] text-2xl text-[#8b7242]">
                ✓
              </span>
              <h2 className="mt-3 font-serif text-2xl text-[#292821]">Verified Reservation</h2>
              <p className="mt-1 font-mono text-sm tracking-wider text-[#8b7242]">
                Reference: {booking.id}
              </p>
            </div>

            <div className="p-6 sm:p-8">
              <div className="rounded-lg border border-[#eeeae1] bg-[#faf8f3] p-5">
                <dl className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-[#eeeae1] pb-2">
                    <dt className="text-[#77746c]">Hotel Name</dt>
                    <dd className="font-serif font-bold text-[#292821]">My Hotel</dd>
                  </div>
                  <div className="flex justify-between border-b border-[#eeeae1] pb-2">
                    <dt className="text-[#77746c]">Booking Reference</dt>
                    <dd className="font-mono font-medium text-[#292821]">{booking.id}</dd>
                  </div>
                  <div className="flex justify-between border-b border-[#eeeae1] pb-2">
                    <dt className="text-[#77746c]">Guest Name</dt>
                    <dd className="font-medium text-[#292821]">
                      {maskName(booking.form.fullName)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-[#eeeae1] pb-2">
                    <dt className="text-[#77746c]">Stay Dates</dt>
                    <dd className="font-medium text-[#292821]">
                      {formatDate(booking.form.checkIn)} – {formatDate(booking.form.checkOut)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-[#eeeae1] pb-2">
                    <dt className="text-[#77746c]">Room Category</dt>
                    <dd className="font-semibold text-[#8b7242]">
                      {booking.form.roomType} ({booking.pricing.roomCount} {booking.pricing.roomCount === 1 ? 'room' : 'rooms'})
                    </dd>
                  </div>
                  <div className="flex justify-between pt-1">
                    <dt className="text-[#77746c]">Reservation Status</dt>
                    <dd>
                      <span className="rounded-full border border-[#a8c79c] bg-[#2d5027] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#ddffd6]">
                        {booking.status}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-6 rounded-lg border border-[#e8dfc7] bg-[#fdfbf6] p-4 text-xs leading-5 text-[#62583f]">
                <p className="font-semibold text-[#292821]">Official Registry Record:</p>
                <p className="mt-1">
                  This public verification certificate confirms that reservation {booking.id} is an authentic registration in the My Hotel database. To protect guest confidentiality, sensitive personal contact info and financial transactions remain strictly hidden.
                </p>
              </div>

              <div className="mt-8 flex justify-center gap-4">
                <Link
                  to="/"
                  className="rounded-md bg-[#292821] px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#a88b53]"
                >
                  Return to Homepage
                </Link>
                <Link
                  to={`/check-booking?id=${encodeURIComponent(booking.id)}`}
                  className="rounded-md border border-[#e2ddd1] px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#292821] transition-colors hover:bg-[#f7f5ef]"
                >
                  Guest Self-Service
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-[#e5a8a1] bg-white p-8 text-center shadow-[0_12px_36px_rgba(39,35,26,0.07)]">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#fdf5f4] text-2xl text-[#a73e32]">
              ✕
            </span>
            <h2 className="mt-4 font-serif text-2xl text-[#292821]">Unverified Reservation</h2>
            <p className="mt-2 text-sm leading-6 text-[#77746c]">
              {bookingId
                ? `No active reservation could be authenticated for reference number "${bookingId}".`
                : 'No reservation identifier was provided for verification.'}
            </p>
            <div className="mt-6">
              <Link
                to="/check-booking"
                className="inline-block rounded-md bg-[#292821] px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#a88b53]"
              >
                Go to Check Your Booking
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
