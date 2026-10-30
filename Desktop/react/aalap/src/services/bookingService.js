import { activityPricing, experiences, includedAmenities, roomPricing, roomTypes } from '../data/bookingOptions.js';

const STORAGE_KEY = 'my_hotel_bookings_v1';

export function formatCurrency(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numericValue);
}

export function formatDate(value) {
  if (!value) return 'Not selected';
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

export function calculateStayNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return 0;
  }
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / millisecondsPerDay));
}

export function maskPhoneNumber(phone = '') {
  const trimmed = phone.trim();
  if (trimmed.length < 5) return '••••••';
  // Keep first 3 chars (e.g. +91 or first 2-3 digits) and last 3 chars
  const visiblePrefix = trimmed.slice(0, 3);
  const visibleSuffix = trimmed.slice(-3);
  const maskedMiddle = '•'.repeat(Math.max(4, trimmed.length - 6));
  return `${visiblePrefix} ${maskedMiddle} ${visibleSuffix}`;
}

export function maskName(name = '') {
  const parts = name.trim().split(/\s+/);
  return parts
    .map((part) => {
      if (part.length <= 1) return part;
      return part[0] + '*'.repeat(Math.min(5, part.length - 1));
    })
    .join(' ');
}

export function generateBookingId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MH-${year}${month}${day}-${randomChars}`;
}

export function calculateBookingPricing(form, selectedExperiences = []) {
  const stayNights = calculateStayNights(form.checkIn, form.checkOut);
  const adults = Number(form.adults || 0);
  const children = Number(form.children || 0);
  const totalGuests = Number.isFinite(adults + children) ? adults + children : 0;
  const roomCount = Number(form.rooms || 0);

  const roomConfig = roomPricing[form.roomType] || null;
  const pricePerRoomPerNight = roomConfig ? roomConfig.pricePerNight : 0;
  const totalRoomCharge = stayNights > 0 && roomCount > 0 ? pricePerRoomPerNight * roomCount * stayNights : 0;

  const chosenExperiences = experiences.filter(({ id }) => selectedExperiences.includes(id));
  const activityRows = chosenExperiences.map((activity) => {
    const unitPrice = activityPricing[activity.id]?.unitPrice ?? 0;
    const participantCount = totalGuests;
    const charge = participantCount * unitPrice;
    return {
      id: activity.id,
      name: activity.name,
      unitPrice,
      participantCount,
      charge,
    };
  });

  const totalActivityCharges = activityRows.reduce((sum, item) => sum + item.charge, 0);
  const finalTotal = stayNights > 0 ? totalRoomCharge + totalActivityCharges : 0;

  return {
    stayNights,
    totalGuests,
    roomCount,
    pricePerRoomPerNight,
    totalRoomCharge,
    activityRows,
    totalActivityCharges,
    finalTotal,
  };
}

export function getAllBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading bookings from storage:', error);
    return [];
  }
}

export function saveBooking({ form, amenities = {}, selectedExperiences = [] }) {
  const bookingId = generateBookingId();
  const pricing = calculateBookingPricing(form, selectedExperiences);

  const selectedAmenityLabels = includedAmenities
    .filter(({ id }) => amenities[id])
    .map(({ label }) => label);

  const newBooking = {
    id: bookingId,
    createdAt: new Date().toISOString(),
    status: 'Confirmed', // Initial confirmed status
    form: {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      adults: Number(form.adults || 1),
      children: Number(form.children || 0),
      rooms: Number(form.rooms || 1),
      roomType: form.roomType || roomTypes[0],
      requests: form.requests ? form.requests.trim() : '',
    },
    amenities: selectedAmenityLabels,
    selectedExperiences,
    pricing,
    payment: {
      total: pricing.finalTotal,
      status: 'Pay at Check-in (Pending Backend Gateway)',
      paidAmount: 0,
      outstandingAmount: pricing.finalTotal,
    },
  };

  const existing = getAllBookings();
  const updated = [newBooking, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving booking to storage:', error);
  }

  return newBooking;
}

export function getBookingById(bookingId) {
  if (!bookingId) return null;
  const normalizedId = bookingId.trim().toUpperCase();
  const all = getAllBookings();
  return all.find((b) => b.id.trim().toUpperCase() === normalizedId) || null;
}

export function verifyAndGetBooking(bookingId, contactInfo) {
  if (!bookingId || !contactInfo) {
    return {
      success: false,
      error: 'MISSING_FIELDS',
      message: 'Please provide both your Booking ID and registered contact details.',
    };
  }

  const normalizedId = bookingId.trim().toUpperCase();
  const normalizedContact = contactInfo.trim().toLowerCase();
  const contactDigits = normalizedContact.replace(/\D/g, '');

  const booking = getBookingById(normalizedId);
  if (!booking) {
    return {
      success: false,
      error: 'NOT_FOUND',
      message: `No reservation found with Booking ID "${bookingId.trim()}". Please verify your reservation reference and try again.`,
    };
  }

  const bookingEmail = booking.form.email.trim().toLowerCase();
  const bookingPhoneDigits = booking.form.phone.replace(/\D/g, '');

  const emailMatches = normalizedContact === bookingEmail;
  const phoneMatches = contactDigits.length >= 6 && (
    bookingPhoneDigits.endsWith(contactDigits) || contactDigits.endsWith(bookingPhoneDigits)
  );

  if (!emailMatches && !phoneMatches) {
    return {
      success: false,
      error: 'VERIFICATION_FAILED',
      message: 'The registered email address or phone number does not match this reservation reference.',
    };
  }

  return {
    success: true,
    booking,
  };
}

export function requestCancellation(bookingId, contactInfo) {
  const verification = verifyAndGetBooking(bookingId, contactInfo);
  if (!verification.success) {
    return verification;
  }

  const { booking } = verification;

  if (booking.status === 'Cancelled') {
    return {
      success: false,
      error: 'ALREADY_CANCELLED',
      message: `Reservation ${booking.id} is already cancelled.`,
    };
  }

  const today = new Date().toISOString().slice(0, 10);
  if (booking.form.checkOut < today) {
    return {
      success: false,
      error: 'EXPIRED_STAY',
      message: `Reservation ${booking.id} has already concluded and is not eligible for cancellation.`,
    };
  }

  // Backend Integration Check:
  // Under My Hotel security guidelines, cancellations must be verified and authorized by the server.
  // We do not mark the booking as cancelled merely by updating frontend state.
  return {
    success: false,
    error: 'BACKEND_SERVICE_UNAVAILABLE',
    message: 'Backend cancellation service is not connected. In accordance with My Hotel security guidelines, cancellations cannot be processed purely through client state. Your reservation status remains Confirmed. Please contact hotel reservations at +91 00000 00000 or email support@myhotel.com to authorize your cancellation.',
  };
}

export function getCancellationPolicy() {
  return {
    isConfigured: false,
    policyName: 'Hotel Standard Cancellation',
    status: 'Pending Hotel Management Configuration',
    message: 'The hotel management has not yet configured automated cancellation deadlines, fee tiers, or refund percentages on the backend server. Please contact the front desk directly for the applicable cancellation terms.',
  };
}

export function getBackendStatus() {
  return {
    hasServerBackend: false,
    otpVerificationSupported: false,
    backendPersistence: false,
    automatedCancellation: false,
    summary: 'Frontend guest reservation interface active. Backend server API, SMS/Email OTP service, and payment gateway remain to be connected.',
  };
}
