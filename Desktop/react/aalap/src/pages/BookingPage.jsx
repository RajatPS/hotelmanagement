import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { activityPricing, experiences, includedAmenities, roomPricing, roomTypes } from '../data/bookingOptions.js';
import { saveBooking } from '../services/bookingService.js';

const guestLimits = { adults: { min: 1, max: 10 }, children: { min: 0, max: 10 } };
const inputClass = 'mt-2 w-full rounded-md border border-[#e2ddd1] bg-white px-3.5 py-3 text-sm text-[#292821] outline-none transition focus:border-[#a88b53] focus:ring-2 focus:ring-[#a88b53]/15';
const fieldLabelClass = 'block text-sm font-medium text-[#39372f]';
const today = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

function dateAfter(dateValue) {
  if (!dateValue) return today();
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatCurrency(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatDate(value) {
  if (!value) return 'Not selected';
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function calculateStayNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;

  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return 0;
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / millisecondsPerDay));
}

function getRequiredRoomCount(roomType, adults) {
  const roomConfig = roomPricing[roomType];
  const safeAdults = Number(adults) || 0;

  if (!roomConfig || !Number.isFinite(safeAdults) || safeAdults <= 0) {
    return 1;
  }

  return Math.ceil(safeAdults / roomConfig.maxAdultsPerRoom);
}

const discoveredActivityImages = Object.entries(
  import.meta.glob('../assets/activities/**/*.{png,PNG,jpg,JPG,jpeg,JPEG,webp,WEBP,avif,AVIF}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
);

function getActivityImage(activityId) {
  return discoveredActivityImages.find(([path]) => path.includes(`/activities/${activityId}/`))?.[1];
}

function BookingSummary({ form, amenities, selectedExperiences }) {
  const guestCount = useMemo(() => {
    const adults = Number(form.adults || 0);
    const children = Number(form.children || 0);
    return Number.isFinite(adults + children) ? adults + children : 0;
  }, [form.adults, form.children]);

  const stayNights = useMemo(
    () => calculateStayNights(form.checkIn, form.checkOut),
    [form.checkIn, form.checkOut],
  );

  const chosenExperiences = useMemo(
    () => experiences.filter(({ id }) => selectedExperiences.includes(id)),
    [selectedExperiences],
  );

  const selectedAmenityLabels = useMemo(
    () => includedAmenities.filter(({ id }) => amenities[id]).map(({ label }) => label),
    [amenities],
  );

  const activityRows = useMemo(() => {
    return chosenExperiences.map((activity) => {
      const pricing = activityPricing[activity.id];
      const unitPrice = Number(pricing?.unitPrice ?? 0);
      const participantCount = guestCount;
      const charge = participantCount * unitPrice;

      return {
        ...activity,
        unitPrice,
        participantCount,
        charge,
      };
    });
  }, [chosenExperiences, guestCount]);

  const selectedRoom = roomPricing[form.roomType] ?? null;
  const roomPriceLabel = selectedRoom ? `${formatCurrency(selectedRoom.pricePerNight)} per room per night` : 'Price to be confirmed';
  const roomCount = Number(form.rooms || 0);
  const hasValidDates = Boolean(form.checkIn && form.checkOut && stayNights > 0);
  const roomCharge = hasValidDates && selectedRoom && roomCount > 0
    ? selectedRoom.pricePerNight * roomCount * stayNights
    : 0;
  const minimumRequiredRooms = getRequiredRoomCount(form.roomType, form.adults);

  const totalActivityCharges = activityRows.reduce((total, activity) => total + (Number(activity.charge) || 0), 0);
  const finalTotal = hasValidDates ? roomCharge + totalActivityCharges : null;

  return (
    <aside className="h-fit rounded-xl border border-[#e9e4d7] bg-white p-5 shadow-[0_12px_36px_rgba(39,35,26,0.07)] sm:p-7 lg:sticky lg:top-24">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b7242]">A thoughtful stay</p>
      <h2 className="mt-2 font-serif text-2xl text-[#292821]">Your Booking Summary</h2>
      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex justify-between gap-4"><dt className="text-[#77746c]">Check-in</dt><dd className="text-right font-medium text-[#292821]">{formatDate(form.checkIn)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-[#77746c]">Check-out</dt><dd className="text-right font-medium text-[#292821]">{formatDate(form.checkOut)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-[#77746c]">Nights</dt><dd className="text-right font-medium text-[#292821]">{hasValidDates ? stayNights : 'Not available'}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-[#77746c]">Guests</dt><dd className="text-right font-medium text-[#292821]">{form.adults || 0} adults, {form.children || 0} children ({guestCount} total)</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-[#77746c]">Rooms</dt><dd className="text-right font-medium text-[#292821]">{form.rooms || 0}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-[#77746c]">Room type</dt><dd className="text-right font-medium text-[#292821]">{form.roomType || 'Not selected'}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-[#77746c]">Room rate</dt><dd className="text-right font-medium text-[#8b7242]">{roomPriceLabel}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-[#77746c]">Minimum rooms required</dt><dd className="text-right font-medium text-[#292821]">{minimumRequiredRooms}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-[#77746c]">Room charge</dt><dd className="text-right font-medium text-[#8b7242]">{hasValidDates && selectedRoom && roomCount > 0 ? formatCurrency(roomCharge) : 'Not available'}</dd></div>
      </dl>

      <div className="my-6 border-t border-[#eeeae1]" />
      <h3 className="text-sm font-semibold text-[#292821]">Included amenities</h3>
      <p className="mt-1 text-xs leading-5 text-[#77746c]">All amenities below remain included with every stay, whether or not you select them as preferences.</p>
      {selectedAmenityLabels.length ? (
        <ul className="mt-3 space-y-2 text-sm text-[#62583f]">
          {selectedAmenityLabels.map((label) => <li key={label} className="flex justify-between gap-3"><span>{label}</span><span className="shrink-0 text-xs font-medium text-[#63805b]">₹0 extra</span></li>)}
        </ul>
      ) : <p className="mt-3 text-sm text-[#77746c]">No preferences selected; all included amenities remain available.</p>}

      <div className="my-6 border-t border-[#eeeae1]" />
      <h3 className="text-sm font-semibold text-[#292821]">Selected paid activities</h3>
      {activityRows.length ? (
        <ul className="mt-3 space-y-3">
          {activityRows.map((activity) => (
            <li key={activity.id} className="space-y-1 text-sm">
              <div className="flex justify-between gap-3 text-[#62583f]">
                <span>{activity.name}</span>
                <span className="shrink-0 text-right font-medium text-[#8b7242]">{formatCurrency(activity.charge)}</span>
              </div>
              <div className="text-right text-[11px] text-[#77746c]">
                {`${formatCurrency(activity.unitPrice)} / guest · ${activity.participantCount} guests`}
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="mt-3 text-sm text-[#77746c]">Choose any experiences to see them here.</p>}
      {activityRows.length > 0 && (
        <p className="mt-3 text-right text-xs font-medium text-[#62583f]">Total activity charges: {formatCurrency(totalActivityCharges)}</p>
      )}

      <div className="my-6 border-t border-[#eeeae1]" />
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm font-semibold text-[#292821]">Estimated total</span>
        <span className="text-right text-sm font-semibold text-[#8b7242]">{finalTotal === null ? 'Not available yet' : formatCurrency(finalTotal)}</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-[#77746c]">
        {finalTotal === null
          ? 'Choose a valid check-in and check-out date to calculate the onsen and total estimate. Complimentary amenities add no extra charge.'
          : `Room charges and taxes are not yet configured for this booking. Complimentary amenities add no extra charge.`}
      </p>
    </aside>
  );
}

function BookingReview({ form, amenities, selectedExperiences, onClose }) {
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const navigate = useNavigate();

  const handleConfirm = () => {
    const booking = saveBooking({ form, amenities, selectedExperiences });
    setConfirmedBooking(booking);
  };

  const amenityNames = includedAmenities.filter(({ id }) => amenities[id]).map(({ label }) => label);
  const activityNames = experiences.filter(({ id }) => selectedExperiences.includes(id)).map(({ name }) => name);

  if (confirmedBooking) {
    return (
      <section id="booking-review" aria-labelledby="confirmation-title" className="mt-8 rounded-xl border border-[#a8c79c] bg-[#f5faf3] p-5 sm:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2d5027]">Reservation created</p>
        <h2 id="confirmation-title" className="mt-2 font-serif text-2xl text-[#1f3b1a]">Reservation Confirmed!</h2>
        <p className="mt-3 text-sm leading-6 text-[#293d25]">
          Your stay has been recorded with Reference Number:{' '}
          <strong className="font-mono text-base text-[#1f3b1a]">{confirmedBooking.id}</strong>.
        </p>
        <p className="mt-1 text-xs text-[#526a4c]">
          You can retrieve, view, print, or cancel your booking at any time from our guest portal using this reservation number and your contact details.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate(`/check-booking?id=${encodeURIComponent(confirmedBooking.id)}`)}
            className="rounded-md bg-[#292821] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#a88b53]"
          >
            View Your Booking Details & Voucher →
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#c5dbbe] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#293d25] transition-colors hover:bg-[#eaf4e7]"
          >
            Close
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="booking-review" aria-labelledby="review-title" className="mt-8 rounded-xl border border-[#d9c99e] bg-[#fbf8f0] p-5 sm:p-7">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b7242]">Review your stay</p>
      <h2 id="review-title" className="mt-2 font-serif text-2xl text-[#292821]">Review Your Booking Request</h2>
      <p className="mt-3 text-sm leading-6 text-[#62583f]">Please check your details below. You can confirm your reservation now to receive your booking reference.</p>
      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
        <div><dt className="text-[#77746c]">Guest</dt><dd className="mt-1 font-medium text-[#292821]">{form.fullName} · {form.email} · {form.phone}</dd></div>
        <div><dt className="text-[#77746c]">Stay</dt><dd className="mt-1 font-medium text-[#292821]">{formatDate(form.checkIn)} – {formatDate(form.checkOut)}</dd></div>
        <div><dt className="text-[#77746c]">Guests and rooms</dt><dd className="mt-1 font-medium text-[#292821]">{form.adults} adults, {form.children} children · {form.rooms} {form.rooms === '1' ? 'room' : 'rooms'} · {form.roomType}</dd></div>
        <div><dt className="text-[#77746c]">Special requests</dt><dd className="mt-1 whitespace-pre-wrap font-medium text-[#292821]">{form.requests.trim() || 'None'}</dd></div>
        <div><dt className="text-[#77746c]">Included amenity preferences</dt><dd className="mt-1 font-medium text-[#292821]">{amenityNames.length ? amenityNames.join(', ') : 'No preferences selected. All included amenities remain available.'}</dd></div>
        <div><dt className="text-[#77746c]">Selected experiences</dt><dd className="mt-1 font-medium text-[#292821]">{activityNames.length ? activityNames.join(', ') : 'None selected'}</dd></div>
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          className="rounded-md bg-[#292821] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#a88b53] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a88b53]"
        >
          Confirm Reservation
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-[#d9c99e] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#62583f] transition-colors hover:bg-[#f3eedf]"
        >
          Close Review
        </button>
      </div>
    </section>
  );
}

export default function BookingPage() {
  const [form, setForm] = useState(() => {
    const checkIn = today();
    return {
      checkIn,
      checkOut: dateAfter(checkIn),
      adults: '2',
      children: '0',
      rooms: '1',
      roomType: roomTypes[0],
      fullName: '',
      email: '',
      phone: '',
      requests: '',
    };
  });
  const [amenities, setAmenities] = useState(() => Object.fromEntries(includedAmenities.map(({ id }) => [id, true])));
  const [selectedExperiences, setSelectedExperiences] = useState([]);
  const [errors, setErrors] = useState({});
  const [showReview, setShowReview] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      const nextForm = { ...current, [name]: value };

      if (name === 'adults' || name === 'roomType') {
        const nextAdults = Number(name === 'adults' ? value : nextForm.adults || 0);
        const roomConfig = roomPricing[nextForm.roomType];

        if (roomConfig && nextAdults > 0) {
          const requiredRooms = getRequiredRoomCount(nextForm.roomType, nextAdults);
          if (Number(nextForm.rooms || 0) < requiredRooms) {
            nextForm.rooms = String(requiredRooms);
          }
        }
      }

      return nextForm;
    });
    setErrors((current) => ({ ...current, [name]: '' }));
    setShowReview(false);
  };

  const toggleExperience = (id) => {
    setSelectedExperiences((current) => current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : [...current, id]);
    setShowReview(false);
  };

  const toggleAmenity = (id, checked) => {
    setAmenities((current) => ({ ...current, [id]: checked }));
    setShowReview(false);
  };

  const validate = (event) => {
    event.preventDefault();
    const nextErrors = {};
    const currentDate = today();
    const roomCount = Number(form.rooms);
    const adultCount = Number(form.adults);
    const childCount = Number(form.children);
    const selectedRoom = roomPricing[form.roomType] ?? null;

    if (!form.checkIn) nextErrors.checkIn = 'Choose a check-in date.';
    else if (form.checkIn < currentDate) nextErrors.checkIn = 'Check-in cannot be in the past.';
    if (!form.checkOut) nextErrors.checkOut = 'Choose a check-out date.';
    else if (form.checkIn && form.checkOut <= form.checkIn) nextErrors.checkOut = 'Check-out must be later than check-in.';
    for (const [field, { min, max }] of Object.entries(guestLimits)) {
      const count = Number(form[field]);
      if (!Number.isInteger(count) || count < min || count > max) {
        nextErrors[field] = field === 'adults'
          ? 'Enter a whole number from 1 to 10.'
          : 'Enter a whole number from 0 to 10.';
      }
    }
    if (!Number.isInteger(roomCount) || roomCount < 1) nextErrors.rooms = 'Choose at least one room.';
    if (!roomTypes.includes(form.roomType)) nextErrors.roomType = 'Choose a room type.';
    if (selectedRoom) {
      const requiredRooms = getRequiredRoomCount(form.roomType, adultCount);
      if (roomCount < requiredRooms) {
        nextErrors.rooms = `At least ${requiredRooms} room${requiredRooms > 1 ? 's' : ''} are required for ${adultCount} adults in a ${form.roomType}.`;
      }
      const maxChildren = selectedRoom.maxChildrenPerRoom * roomCount;
      if (childCount > maxChildren) nextErrors.children = `This room selection allows up to ${maxChildren} children.`;
    }
    if (form.fullName.trim().length < 2) nextErrors.fullName = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!/^[+()\d\s.-]{7,20}$/.test(form.phone.trim())) nextErrors.phone = 'Enter a valid phone number.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setShowReview(false);
      const firstInvalidField = Object.keys(nextErrors)[0];
      requestAnimationFrame(() => document.querySelector(`[name="${firstInvalidField}"]`)?.focus());
      return;
    }
    setShowReview(true);
    requestAnimationFrame(() => document.getElementById('booking-review')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  };

  const fieldError = (name) => errors[name]
    ? <p id={`${name}-error`} className="mt-1.5 text-xs text-[#a73e32]">{errors[name]}</p>
    : null;

  const describedBy = (name) => errors[name] ? `${name}-error` : undefined;

  return (
    <main className="min-h-screen bg-[#f7f5ef] pt-[76px]">
      <header className="bg-[#25251f] px-5 py-14 text-white sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d5b97f]">My Hotel · A thoughtful stay</p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Book Your Stay</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">Share your stay details and choose the experiences you would like to enjoy. We’ll show your preferences clearly before you review your request.</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div>
          <form onSubmit={validate} noValidate className="space-y-8">
            <section aria-labelledby="stay-details-title" className="rounded-xl border border-[#e9e4d7] bg-white p-5 sm:p-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b7242]">Your visit</p>
              <h2 id="stay-details-title" className="mt-2 font-serif text-2xl text-[#292821]">Guest and Stay Details</h2>
              <div className="mt-6 grid gap-x-5 gap-y-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="checkIn" className={fieldLabelClass}>Check-in date</label>
                  <input id="checkIn" name="checkIn" type="date" min={today()} value={form.checkIn} onChange={(event) => {
                    updateField(event);
                    if (form.checkOut <= event.target.value) setForm((current) => ({ ...current, checkOut: dateAfter(event.target.value) }));
                  }} aria-invalid={Boolean(errors.checkIn)} aria-describedby={describedBy('checkIn')} required className={inputClass} />
                  {fieldError('checkIn')}
                </div>
                <div>
                  <label htmlFor="checkOut" className={fieldLabelClass}>Check-out date</label>
                  <input id="checkOut" name="checkOut" type="date" min={dateAfter(form.checkIn)} value={form.checkOut} onChange={updateField} aria-invalid={Boolean(errors.checkOut)} aria-describedby={describedBy('checkOut')} required className={inputClass} />
                  {fieldError('checkOut')}
                </div>
                <div>
                  <label htmlFor="adults" className={fieldLabelClass}>Adults</label>
                  <input id="adults" name="adults" type="number" min="1" max="10" step="1" value={form.adults} onChange={updateField} aria-invalid={Boolean(errors.adults)} aria-describedby={describedBy('adults')} required className={inputClass} />
                  {fieldError('adults')}
                </div>
                <div>
                  <label htmlFor="children" className={fieldLabelClass}>Children</label>
                  <input id="children" name="children" type="number" min="0" max="10" step="1" value={form.children} onChange={updateField} aria-invalid={Boolean(errors.children)} aria-describedby={describedBy('children')} required className={inputClass} />
                  {fieldError('children')}
                </div>
                <div>
                  <label htmlFor="rooms" className={fieldLabelClass}>Number of rooms</label>
                  <input id="rooms" name="rooms" type="number" min="1" step="1" value={form.rooms} onChange={updateField} aria-invalid={Boolean(errors.rooms)} aria-describedby={describedBy('rooms')} required className={inputClass} />
                  {fieldError('rooms')}
                </div>
                <div>
                  <label htmlFor="roomType" className={fieldLabelClass}>Room type</label>
                  <select id="roomType" name="roomType" value={form.roomType} onChange={updateField} aria-invalid={Boolean(errors.roomType)} aria-describedby={describedBy('roomType')} required className={inputClass}>
                    {roomTypes.map((roomType) => <option key={roomType} value={roomType}>{roomType}</option>)}
                  </select>
                  <div className="mt-2 rounded-md border border-[#e9e4d7] bg-[#faf8f3] px-3 py-2 text-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b7242]">Selected room price</p>
                    <p className="mt-1 font-medium text-[#292821]">{roomPricing[form.roomType] ? `${formatCurrency(roomPricing[form.roomType].pricePerNight)} per room per night` : 'Price to be confirmed'}</p>
                  </div>
                  {fieldError('roomType')}
                </div>
                <div>
                  <label htmlFor="fullName" className={fieldLabelClass}>Full name</label>
                  <input id="fullName" name="fullName" type="text" autoComplete="name" value={form.fullName} onChange={updateField} aria-invalid={Boolean(errors.fullName)} aria-describedby={describedBy('fullName')} placeholder="Your name" required className={inputClass} />
                  {fieldError('fullName')}
                </div>
                <div>
                  <label htmlFor="email" className={fieldLabelClass}>Email address</label>
                  <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} aria-invalid={Boolean(errors.email)} aria-describedby={describedBy('email')} placeholder="you@example.com" required className={inputClass} />
                  {fieldError('email')}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="phone" className={fieldLabelClass}>Phone number</label>
                  <input id="phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={updateField} aria-invalid={Boolean(errors.phone)} aria-describedby={describedBy('phone')} placeholder="+91 00000 00000" required className={inputClass} />
                  {fieldError('phone')}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="requests" className={fieldLabelClass}>Special requests <span className="font-normal text-[#77746c]">(optional)</span></label>
                  <textarea id="requests" name="requests" rows="3" value={form.requests} onChange={updateField} placeholder="Let us know about any additional information." className={inputClass} />
                </div>
              </div>
            </section>

            <section aria-labelledby="amenities-title" className="rounded-xl border border-[#e9e4d7] bg-white p-5 sm:p-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b7242]">A little extra comfort</p>
              <h2 id="amenities-title" className="mt-2 font-serif text-2xl text-[#292821]">Included With Your Stay</h2>
              <p className="mt-2 text-sm leading-6 text-[#77746c]">These amenities are complimentary for every hotel guest. Select your interests to help us prepare; your access is included whether or not a box is checked.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {includedAmenities.map(({ id, label }) => (
                  <label key={id} className="flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-lg border border-[#eeeae1] p-4 transition-colors hover:border-[#cbbb94]">
                    <span className="flex items-center gap-3 text-sm text-[#39372f]">
                      <input type="checkbox" checked={amenities[id]} onChange={(event) => toggleAmenity(id, event.target.checked)} className="h-4 w-4 accent-[#8b7242]" />
                      {label}
                    </span>
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#63805b]">Included · ₹0</span>
                  </label>
                ))}
              </div>
            </section>

            <section aria-labelledby="experiences-title" className="rounded-xl border border-[#e9e4d7] bg-white p-5 sm:p-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b7242]">Make it your own</p>
              <h2 id="experiences-title" className="mt-2 font-serif text-2xl text-[#292821]">Choose Your Experiences</h2>
              <p className="mt-2 text-sm leading-6 text-[#77746c]">Select experiences you are interested in. Rates are not listed in the available hotel information and must be confirmed before booking.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {experiences.map((activity) => {
                  const image = getActivityImage(activity.id);
                  const activityRate = activityPricing[activity.id]?.unitPrice ?? 0;
                  const chargeText = `${formatCurrency(activityRate)} per guest`;
                  return (
                    <label key={activity.id} className="group cursor-pointer overflow-hidden rounded-lg border border-[#eeeae1] transition-shadow hover:shadow-[0_12px_30px_rgba(39,35,26,0.08)]">
                      {image && <img src={image} alt="" loading="lazy" className="h-40 w-full object-cover" />}
                      <span className="block p-4">
                        <span className="flex items-start gap-3">
                          <input type="checkbox" checked={selectedExperiences.includes(activity.id)} onChange={() => toggleExperience(activity.id)} className="mt-1 h-4 w-4 shrink-0 accent-[#8b7242]" />
                          <span>
                            <span className="block font-serif text-lg text-[#292821]">{activity.name}</span>
                            <span className="mt-1 block text-xs leading-5 text-[#77746c]">{activity.description}</span>
                            <span className="mt-3 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8b7242]">{chargeText}</span>
                          </span>
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            <button type="submit" className="w-full rounded-md bg-[#292821] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#a88b53] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a88b53] sm:w-auto">Review Booking Request</button>
          </form>

          {showReview && <BookingReview form={form} amenities={amenities} selectedExperiences={selectedExperiences} onClose={() => setShowReview(false)} />}
        </div>

        <BookingSummary form={form} amenities={amenities} selectedExperiences={selectedExperiences} />
      </div>
    </main>
  );
}
