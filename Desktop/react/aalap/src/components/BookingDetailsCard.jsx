import { Link } from 'react-router';
import BookingQRCode from './BookingQRCode.jsx';
import {
  formatCurrency,
  formatDate,
  maskPhoneNumber,
} from '../services/bookingService.js';

export default function BookingDetailsCard({
  booking,
  onReset,
  showCancelAction = true,
}) {
  const { id, createdAt, status, form, amenities = [], pricing, payment } = booking;

  const handlePrint = () => {
    window.print();
  };

  const isCancelled = status === 'Cancelled';

  return (
    <article
      id="printable-voucher"
      className="overflow-hidden rounded-xl border border-[#e9e4d7] bg-white shadow-[0_12px_36px_rgba(39,35,26,0.07)] print:border-none print:shadow-none"
    >
      {/* Voucher Header */}
      <div className="border-b border-[#eeeae1] bg-[#292821] px-6 py-6 text-white sm:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-serif text-2xl tracking-wide text-white">
                My <span className="italic text-[#d5b97f]">Hotel</span>
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e3c990]">
                Official Voucher
              </span>
            </div>
            <p className="mt-1 text-xs text-white/70">
              Reservation Reference:{' '}
              <strong className="font-mono text-sm tracking-wider text-white">{id}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                isCancelled
                  ? 'border border-[#e5a8a1] bg-[#73271f] text-[#ffdad5]'
                  : 'border border-[#a8c79c] bg-[#2d5027] text-[#ddffd6]'
              }`}
            >
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-current" />
              {status || 'Confirmed'}
            </span>
          </div>
        </div>

        {createdAt && (
          <p className="mt-3 text-[11px] text-white/50">
            Booked on {formatDate(createdAt.slice(0, 10))}
          </p>
        )}
      </div>

      <div className="p-6 sm:p-8">
        {/* Guest and Stay Details Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Guest Information */}
          <section aria-labelledby="guest-info-heading" className="rounded-lg border border-[#f0ece1] bg-[#faf8f3] p-5">
            <h3 id="guest-info-heading" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b7242]">
              Guest Information
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[#77746c]">Primary Guest</dt>
                <dd className="font-medium text-[#292821]">{form.fullName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#77746c]">Registered Email</dt>
                <dd className="font-mono text-xs font-medium text-[#292821]">{form.email}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#77746c]">Protected Phone</dt>
                <dd className="font-mono text-xs font-medium text-[#292821]">
                  {maskPhoneNumber(form.phone)}
                </dd>
              </div>
              {form.requests && (
                <div className="border-t border-[#eeeae1] pt-2">
                  <dt className="text-xs text-[#77746c]">Special Requests:</dt>
                  <dd className="mt-1 text-xs italic text-[#292821]">{form.requests}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* Stay Information */}
          <section aria-labelledby="stay-info-heading" className="rounded-lg border border-[#f0ece1] bg-[#faf8f3] p-5">
            <h3 id="stay-info-heading" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b7242]">
              Stay Information
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[#77746c]">Check-in Date</dt>
                <dd className="font-medium text-[#292821]">{formatDate(form.checkIn)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#77746c]">Check-out Date</dt>
                <dd className="font-medium text-[#292821]">{formatDate(form.checkOut)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#77746c]">Duration of Stay</dt>
                <dd className="font-medium text-[#292821]">
                  {pricing.stayNights} {pricing.stayNights === 1 ? 'night' : 'nights'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#77746c]">Rooms & Guests</dt>
                <dd className="font-medium text-[#292821]">
                  {pricing.roomCount} {pricing.roomCount === 1 ? 'room' : 'rooms'} · {form.adults} adults
                  {form.children > 0 ? `, ${form.children} children` : ''}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#77746c]">Room Category</dt>
                <dd className="font-semibold text-[#8b7242]">{form.roomType}</dd>
              </div>
            </dl>
          </section>
        </div>

        {/* Pricing Breakdown */}
        <section aria-labelledby="pricing-breakdown-heading" className="mt-8 border-t border-[#eeeae1] pt-6">
          <h3 id="pricing-breakdown-heading" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b7242]">
            Room & Experience Price Details
          </h3>

          <div className="mt-4 space-y-3">
            {/* Room charge item */}
            <div className="flex items-center justify-between gap-4 text-sm">
              <div>
                <span className="font-medium text-[#292821]">{form.roomType}</span>
                <span className="ml-2 text-xs text-[#77746c]">
                  ({formatCurrency(pricing.pricePerRoomPerNight)} × {pricing.roomCount} {pricing.roomCount === 1 ? 'room' : 'rooms'} × {pricing.stayNights} nights)
                </span>
              </div>
              <span className="font-medium text-[#292821]">{formatCurrency(pricing.totalRoomCharge)}</span>
            </div>

            {/* Paid Activities */}
            {pricing.activityRows && pricing.activityRows.length > 0 ? (
              pricing.activityRows.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between gap-4 text-sm">
                  <div>
                    <span className="font-medium text-[#292821]">{activity.name}</span>
                    <span className="ml-2 text-xs text-[#77746c]">
                      ({formatCurrency(activity.unitPrice)} × {activity.participantCount} guests)
                    </span>
                  </div>
                  <span className="font-medium text-[#8b7242]">{formatCurrency(activity.charge)}</span>
                </div>
              ))
            ) : null}

            {/* Complimentary amenities */}
            <div className="rounded-lg border border-[#e8dfc7] bg-[#fbf9f2] p-4 text-xs">
              <span className="font-semibold text-[#292821]">Complimentary Inclusions:</span>
              <p className="mt-1 text-[#62583f]">
                {amenities && amenities.length > 0
                  ? amenities.join(' • ')
                  : 'Swimming pool access • Hotel dining area • Five-star restaurant access • Continental dining'}{' '}
                <span className="font-semibold text-[#63805b]">(Included · ₹0)</span>
              </p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="mt-6 border-t border-[#eeeae1] pt-4">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between font-semibold">
                <dt className="text-[#292821]">Total Booking Amount</dt>
                <dd className="text-base text-[#8b7242]">{formatCurrency(payment.total)}</dd>
              </div>
              <div className="flex justify-between text-xs text-[#77746c]">
                <dt>Payment Status</dt>
                <dd className="font-medium text-[#292821]">{payment.status}</dd>
              </div>
              <div className="flex justify-between text-xs text-[#77746c]">
                <dt>Paid Amount</dt>
                <dd className="font-medium text-[#292821]">{formatCurrency(payment.paidAmount)}</dd>
              </div>
              <div className="flex justify-between text-xs font-semibold text-[#8b7242]">
                <dt>Outstanding Balance</dt>
                <dd>{formatCurrency(payment.outstandingAmount)}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* QR Code and Actions Section (hidden during print) */}
        <div className="mt-8 grid gap-6 border-t border-[#eeeae1] pt-6 sm:grid-cols-[1fr_260px] print:hidden">
          <div className="flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b7242]">
                Digital Voucher & Verification
              </h4>
              <p className="mt-2 text-xs leading-5 text-[#77746c]">
                You can save or print your official reservation confirmation to show at hotel check-in. The QR code links to an authentic verification record verifying your stay.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-md bg-[#292821] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#a88b53]"
              >
                <span>🖨️ Download / Print Voucher</span>
              </button>

              {showCancelAction && !isCancelled && (
                <Link
                  to={`/cancel-booking?id=${encodeURIComponent(id)}`}
                  className="inline-flex items-center gap-2 rounded-md border border-[#a73e32]/40 bg-[#fdf5f4] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a73e32] transition-colors hover:bg-[#a73e32] hover:text-white"
                >
                  <span>Cancel This Booking</span>
                </Link>
              )}

              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="rounded-md border border-[#e2ddd1] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#62583f] transition-colors hover:bg-[#f7f5ef]"
                >
                  Check Another Reservation
                </button>
              )}
            </div>
          </div>

          <div>
            <BookingQRCode bookingId={id} />
          </div>
        </div>
      </div>
    </article>
  );
}
