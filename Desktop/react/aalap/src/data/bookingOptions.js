export const roomTypes = ['Deluxe Room', 'Executive Suite', 'Luxury Suite'];

export const roomPricing = {
  'Deluxe Room': { pricePerNight: 10000, maxAdultsPerRoom: 4, maxChildrenPerRoom: 4 },
  'Executive Suite': { pricePerNight: 15000, maxAdultsPerRoom: 2, maxChildrenPerRoom: 2 },
  'Luxury Suite': { pricePerNight: 20000, maxAdultsPerRoom: 2, maxChildrenPerRoom: 2 },
};

export const includedAmenities = [
  { id: 'pool', label: 'Swimming pool access' },
  { id: 'dining', label: 'Hotel dining area' },
  { id: 'restaurant', label: 'Five-star restaurant access' },
  { id: 'continental-dining', label: 'Continental food and dining' },
];

export const activityPricing = {
  'jungle-safari': { id: 'jungle-safari', unitPrice: 2000 },
  'river-boating': { id: 'river-boating', unitPrice: 800 },
  'paragliding': { id: 'paragliding', unitPrice: 2000 },
  'elephant-riding': { id: 'elephant-riding', unitPrice: 1000 },
  'outdoor-onsen': { id: 'outdoor-onsen', unitPrice: 1000 },
};

export const experiences = [
  {
    id: 'jungle-safari',
    name: 'Jungle Safari / Wildlife Safari',
    description: 'Explore wildlife and forest landscapes.',
    pricing: 'paid-price-to-confirm',
    priceInr: activityPricing['jungle-safari'].unitPrice,
  },
  {
    id: 'river-boating',
    name: 'River Boating',
    description: 'Enjoy a boat journey through beautiful river scenery.',
    pricing: 'paid-price-to-confirm',
    priceInr: activityPricing['river-boating'].unitPrice,
  },
  {
    id: 'paragliding',
    name: 'Paragliding',
    description: 'Take in the landscape from above.',
    pricing: 'paid-price-to-confirm',
    priceInr: activityPricing['paragliding'].unitPrice,
  },
  {
    id: 'elephant-riding',
    name: 'Elephant Riding',
    description: 'A scenic journey through forest trails and open landscapes.',
    pricing: 'status-and-price-to-confirm',
    priceInr: activityPricing['elephant-riding'].unitPrice,
  },
  {
    id: 'outdoor-onsen',
    name: 'Outdoor Onsen',
    description: 'A tranquil outdoor bathing experience in nature.',
    pricing: 'status-and-price-to-confirm',
    priceInr: activityPricing['outdoor-onsen'].unitPrice,
  },
];
