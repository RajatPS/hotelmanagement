import { useEffect, useRef, useState } from 'react';

const guestLimits = {
  adults: { min: 1, max: 10 },
  children: { min: 0, max: 10 },
};

function localDateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function parseLocalDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function toLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatBookingDate(value) {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parseLocalDate(value));
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M7.5 3v4M16.5 3v4M3.5 10h17" />
    </svg>
  );
}

function GuestsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3.5 20v-1.25a5.5 5.5 0 0 1 11 0V20M16 5.25a3.25 3.25 0 0 1 0 6.25M17 14a5 5 0 0 1 3.5 4.75V20" />
    </svg>
  );
}

export default function BookingSearch() {
  const [checkIn, setCheckIn] = useState(localDateOffset(0));
  const [checkOut, setCheckOut] = useState(localDateOffset(1));
  const [adults, setAdults] = useState('2');
  const [children, setChildren] = useState('0');
  const [message, setMessage] = useState('');
  const [openPanel, setOpenPanel] = useState(null);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = parseLocalDate(localDateOffset(0));
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const bookingRef = useRef(null);
  const today = localDateOffset(0);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (checkOut <= checkIn) {
      setMessage('Please choose a check-out date after your check-in date.');
      return;
    }
    setMessage(`Your search is ready: ${checkIn} to ${checkOut} for ${adults} adult${adults === '1' ? '' : 's'} and ${children} child${children === '1' ? '' : 'ren'}. This is a sample enquiry; no reservation has been made.`);
  };

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (bookingRef.current && !bookingRef.current.contains(event.target)) setOpenPanel(null);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpenPanel(null);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const openCalendar = (field) => {
    const selectedDate = field === 'checkIn' ? checkIn : checkOut;
    const dateToShow = parseLocalDate(selectedDate);
    setVisibleMonth(new Date(dateToShow.getFullYear(), dateToShow.getMonth(), 1));
    setOpenPanel(openPanel === field ? null : field);
  };

  const changeMonth = (amount) => {
    setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + amount, 1));
  };

  const selectDate = (field, date) => {
    const selectedDate = toLocalDateString(date);
    if (selectedDate < today || (field === 'checkOut' && selectedDate <= checkIn)) return;

    if (field === 'checkIn') {
      setCheckIn(selectedDate);
      if (checkOut <= selectedDate) {
        const nextDay = parseLocalDate(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setCheckOut(toLocalDateString(nextDay));
      }
    } else {
      setCheckOut(selectedDate);
    }

    setMessage('');
    setOpenPanel(null);
  };

  const firstWeekday = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const calendarDays = Array.from({ length: firstWeekday + daysInMonth }, (_, index) => (
    index < firstWeekday ? null : new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index - firstWeekday + 1)
  ));
  const monthLabel = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(visibleMonth);

  const renderCalendar = (field) => (
    <div
      role="dialog"
      aria-label={`${field === 'checkIn' ? 'Check-in' : 'Check-out'} date picker`}
      className="fixed inset-x-4 bottom-4 z-[60] max-h-[80vh] overflow-y-auto rounded-2xl border border-[#eee8dc] bg-white p-5 shadow-[0_20px_60px_rgba(39,35,26,0.2)] animate-[booking-popover-in_180ms_cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none sm:absolute sm:inset-auto sm:top-full sm:mt-3 sm:w-[22rem] sm:p-6 lg:left-0"
    >
      <div className="mb-5 flex items-center justify-between">
        <button type="button" onClick={() => changeMonth(-1)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#62583f] transition-colors hover:bg-[#f7f5ef] focus-visible:outline-2 focus-visible:outline-[#a88b53]" aria-label="Previous month">
          <span aria-hidden="true">←</span>
        </button>
        <h3 className="font-serif text-lg text-[#292821]">{monthLabel}</h3>
        <button type="button" onClick={() => changeMonth(1)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#62583f] transition-colors hover:bg-[#f7f5ef] focus-visible:outline-2 focus-visible:outline-[#a88b53]" aria-label="Next month">
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 text-center text-[10px] font-semibold uppercase tracking-wide text-[#999488]">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => <span key={day} className="py-2">{day}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {calendarDays.map((date, index) => {
          if (!date) return <span key={`blank-${index}`} aria-hidden="true" />;
          const dateString = toLocalDateString(date);
          const disabled = dateString < today || (field === 'checkOut' && dateString <= checkIn);
          const selected = dateString === checkIn || dateString === checkOut;
          const inRange = dateString > checkIn && dateString < checkOut;
          const isToday = dateString === today;

          return (
            <button
              key={dateString}
              type="button"
              disabled={disabled}
              aria-label={formatBookingDate(dateString)}
              aria-pressed={selected}
              onClick={() => selectDate(field, date)}
              className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a88b53] disabled:cursor-not-allowed disabled:text-[#d4d0c8] ${selected ? 'bg-[#a88b53] font-semibold text-white hover:bg-[#8f7441]' : inRange ? 'rounded-none bg-[#f3eee2] text-[#66583b]' : 'text-[#39372f] hover:bg-[#f3eee2]'} ${isToday && !selected ? 'font-semibold ring-1 ring-inset ring-[#c6ad7b]' : ''}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-[#eee8dc] pt-4 text-xs text-[#77746c]">
        <span>{formatBookingDate(checkIn)} <span className="mx-1 text-[#b8ad96]">→</span> {formatBookingDate(checkOut)}</span>
        <button type="button" onClick={() => setOpenPanel(null)} className="font-semibold uppercase tracking-[0.12em] text-[#8b7242] transition-colors hover:text-[#292821] focus-visible:outline-2 focus-visible:outline-[#a88b53]">Done</button>
      </div>
    </div>
  );

  const changeGuestCount = (type, amount) => {
    const currentCount = Number(type === 'adults' ? adults : children);
    const { min, max } = guestLimits[type];
    const nextCount = Math.min(max, Math.max(min, currentCount + amount));
    if (type === 'adults') setAdults(String(nextCount));
    else setChildren(String(nextCount));
    setMessage('');
  };

  return (
    <section id="booking" className="scroll-mt-24 bg-[#f7f5ef] px-5 pb-14 pt-2 sm:px-8">
      <form ref={bookingRef} onSubmit={handleSubmit} className="relative z-20 mx-auto -mt-2 grid max-w-[1180px] gap-0 rounded-xl border border-[#e9e4d7] bg-white shadow-[0_16px_50px_rgba(39,35,26,0.09)] sm:grid-cols-2 lg:-mt-12 lg:grid-cols-[1.15fr_1.15fr_1fr_1fr_auto]">
        {[
          { key: 'checkIn', label: 'CHECK-IN', date: checkIn },
          { key: 'checkOut', label: 'CHECK-OUT', date: checkOut },
        ].map((field, index) => (
          <div key={field.key} className={`relative border-b border-[#e9e4d7] px-4 py-4 sm:px-5 sm:py-5 ${index === 0 ? 'sm:border-r' : ''} lg:border-b-0 lg:border-r`}>
            <p className="mb-2 text-[10px] font-semibold tracking-[0.16em] text-[#817d73]">{field.label}</p>
            <button
              type="button"
              onClick={() => openCalendar(field.key)}
              aria-haspopup="dialog"
              aria-expanded={openPanel === field.key}
              aria-label={`${field.label.toLowerCase()} ${formatBookingDate(field.date)}`}
              className={`flex w-full items-center justify-between gap-3 rounded-md text-left text-sm text-[#292821] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a88b53] ${openPanel === field.key ? 'text-[#8b7242]' : 'hover:text-[#8b7242]'}`}
            >
              <span className="truncate font-medium">{formatBookingDate(field.date)}</span>
              <span className="shrink-0 text-[#a88b53]"><CalendarIcon /></span>
            </button>
            {openPanel === field.key && renderCalendar(field.key)}
          </div>
        ))}

        <div className="relative border-b border-[#e9e4d7] px-4 py-4 sm:border-r sm:px-5 sm:py-5 lg:border-b-0">
          <p className="mb-2 text-[10px] font-semibold tracking-[0.16em] text-[#817d73]">GUESTS</p>
          <button
            type="button"
            onClick={() => setOpenPanel(openPanel === 'guests' ? null : 'guests')}
            aria-haspopup="dialog"
            aria-expanded={openPanel === 'guests'}
            className={`flex w-full items-center justify-between gap-3 text-left text-sm text-[#292821] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a88b53] ${openPanel === 'guests' ? 'text-[#8b7242]' : 'hover:text-[#8b7242]'}`}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-[#a88b53]"><GuestsIcon /></span>
              <span className="truncate font-medium">{adults} Adults · {children} Children</span>
            </span>
            <span className="shrink-0 text-xs text-[#8b7242]" aria-hidden="true">{openPanel === 'guests' ? '⌃' : '⌄'}</span>
          </button>
          {openPanel === 'guests' && (
            <div role="dialog" aria-label="Select guests" className="fixed inset-x-4 bottom-4 z-[60] rounded-2xl border border-[#eee8dc] bg-white p-5 shadow-[0_20px_60px_rgba(39,35,26,0.2)] animate-[booking-popover-in_180ms_cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none sm:absolute sm:inset-auto sm:left-0 sm:top-full sm:mt-3 sm:w-[22rem] sm:p-6">
              {[
                { key: 'adults', label: 'Adults', description: 'Ages 13+', count: adults },
                { key: 'children', label: 'Children', description: 'Ages 0–12', count: children },
              ].map((guest) => {
                const limits = guestLimits[guest.key];
                const count = Number(guest.count);
                return (
                  <div key={guest.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="font-medium text-[#292821]">{guest.label}</p>
                      <p className="mt-1 text-xs text-[#8b887e]">{guest.description}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <button type="button" onClick={() => changeGuestCount(guest.key, -1)} disabled={count <= limits.min} aria-label={`Decrease ${guest.label.toLowerCase()}`} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ded8ca] text-lg text-[#62583f] transition-colors hover:border-[#a88b53] hover:bg-[#f7f5ef] disabled:cursor-not-allowed disabled:opacity-35">−</button>
                      <span className="w-5 text-center text-sm font-semibold text-[#292821]" aria-live="polite">{guest.count}</span>
                      <button type="button" onClick={() => changeGuestCount(guest.key, 1)} disabled={count >= limits.max} aria-label={`Increase ${guest.label.toLowerCase()}`} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ded8ca] text-lg text-[#62583f] transition-colors hover:border-[#a88b53] hover:bg-[#f7f5ef] disabled:cursor-not-allowed disabled:opacity-35">+</button>
                    </div>
                  </div>
                );
              })}
              <div className="mt-4 flex justify-end border-t border-[#eee8dc] pt-4">
                <button type="button" onClick={() => setOpenPanel(null)} className="rounded-md bg-[#292821] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#a88b53] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a88b53]">Done</button>
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="rounded-b-xl bg-[#292821] px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#a88b53] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a88b53] sm:col-span-2 lg:col-span-1 lg:rounded-bl-none lg:rounded-r-xl">Check Availability</button>
        {message && <p role="status" className="border-t border-[#e9e4d7] px-5 py-4 text-sm leading-6 text-[#66583b] sm:col-span-2 lg:col-span-5">{message}</p>}
      </form>
    </section>
  );
}
