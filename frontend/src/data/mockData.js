// Executive Cinema Catalog Mock Data for CineBook
// Primary Cinema Hubs: Guntur (Default), Vijayawada & Tenali

export const CITIES = [
  { id: 'guntur', name: 'Guntur', state: 'Andhra Pradesh', icon: '🌶️', popular: true },
  { id: 'vijayawada', name: 'Vijayawada', state: 'Andhra Pradesh', icon: '🏛️', popular: true },
  { id: 'tenali', name: 'Tenali', state: 'Andhra Pradesh', icon: '🎭', popular: true }
];

export const GENRES = [
  'All', 'Action', 'Drama', 'Crime', 'Sci-Fi', 'Thriller', 'Mass Masala', 'Family'
];

export const LANGUAGES = [
  'All', 'Telugu', 'Hindi', 'Tamil', 'Malayalam', 'Kannada'
];

export const FORMATS = [
  'All', '4K Dolby Atmos', 'IMAX 3D', '2D', '3D', '4DX'
];

// TOP 4 TOLLYWOOD & PAN-INDIA BLOCKBUSTERS WITH REAL HIGH-RES ASSETS
export const MOVIES = [
  {
    id: 'mov-pushpa-2',
    title: 'Pushpa 2: The Rule',
    slug: 'pushpa-2-the-rule',
    tagline: 'The Rule Begins • Wildfire on Screen',
    description: 'Pushpa Raj expands his red sandalwood empire across international borders, clashing in an epic battle of power, swag, and survival against SP Bhanwar Singh Shekhawat. Indian cinema\'s biggest mass spectacle.',
    genres: ['Action', 'Drama'],
    languages: ['Telugu (Dolby Atmos)', 'Hindi', 'Tamil', 'Malayalam', 'Kannada'],
    formats: ['4K Dolby Atmos', 'IMAX 3D', '2D'],
    duration: '3h 20m',
    durationMinutes: 200,
    releaseDate: '2024-12-05',
    rating: 9.6,
    votes: '520.8K',
    censorRating: 'UA 16+',
    poster: '/posters/pushpa2.jpg',
    posterUrl: '/posters/pushpa2.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=1kVK0MZlbI4',
    director: 'Sukumar',
    musicDirector: 'Devi Sri Prasad (DSP)',
    cast: [
      { name: 'Allu Arjun', role: 'Pushpa Raj', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop' },
      { name: 'Rashmika Mandanna', role: 'Srivalli', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' },
      { name: 'Fahadh Faasil', role: 'SP Bhanwar Singh Shekhawat', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' }
    ],
    status: 'NOW_SHOWING',
    isFeatured: true,
    cities: ['guntur', 'vijayawada', 'tenali']
  },
  {
    id: 'mov-devara-1',
    title: 'Devara: Part 1',
    slug: 'devara-part-1',
    tagline: 'Fear and Valour of the Red Sea',
    description: 'In the fearless coastal lands, a heroic sea warrior vows to protect his people from corruption and betrayal, triggering an unstoppable generational battle across treacherous waters.',
    genres: ['Action', 'Thriller'],
    languages: ['Telugu', 'Hindi', 'Tamil', 'Malayalam', 'Kannada'],
    formats: ['4K Dolby Atmos', 'IMAX 3D', '2D'],
    duration: '2h 58m',
    durationMinutes: 178,
    releaseDate: '2024-09-27',
    rating: 9.2,
    votes: '410.2K',
    censorRating: 'UA',
    poster: '/posters/devara.jpg',
    posterUrl: '/posters/devara.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=pKctPN339Jg',
    director: 'Koratala Siva',
    musicDirector: 'Anirudh Ravichander',
    cast: [
      { name: 'Jr NTR', role: 'Devara / Vara', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop' },
      { name: 'Janhvi Kapoor', role: 'Thangam', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' },
      { name: 'Saif Ali Khan', role: 'Bhaira', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' }
    ],
    status: 'NOW_SHOWING',
    isFeatured: true,
    cities: ['guntur', 'vijayawada', 'tenali']
  },
  {
    id: 'mov-kalki-2898',
    title: 'Kalki 2898 AD',
    slug: 'kalki-2898-ad',
    tagline: 'The Future Begins in 2898 AD',
    description: 'In a dystopian futuristic world where Kasi is the last surviving city under the ruthless rule of the Complex, the immortal warrior Ashwatthama rises to safeguard the prophesied avatar from supreme tyrant Supreme Yaskin.',
    genres: ['Sci-Fi', 'Mythology'],
    languages: ['Telugu (IMAX 3D)', 'Hindi', 'Tamil', 'Malayalam', 'Kannada'],
    formats: ['IMAX 3D', '4K Dolby Atmos', '2D'],
    duration: '3h 01m',
    durationMinutes: 181,
    releaseDate: '2024-06-27',
    rating: 9.1,
    votes: '640.1K',
    censorRating: 'UA',
    poster: '/posters/kalki.webp',
    posterUrl: '/posters/kalki.webp',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=kQDd1AhGIHk',
    director: 'Nag Ashwin',
    musicDirector: 'Santhosh Narayanan',
    cast: [
      { name: 'Prabhas', role: 'Bhairava', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop' },
      { name: 'Amitabh Bachchan', role: 'Ashwatthama', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' },
      { name: 'Deepika Padukone', role: 'SUM-80', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' },
      { name: 'Kamal Haasan', role: 'Supreme Yaskin', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop' }
    ],
    status: 'NOW_SHOWING',
    isFeatured: true,
    cities: ['guntur', 'vijayawada', 'tenali']
  },
  {
    id: 'mov-og-2025',
    title: 'OG (They Call Him OG)',
    slug: 'og-they-call-him-og',
    tagline: 'The Original Gangster Returns to Mumbai',
    description: 'A legendary samurai-armed gangster named Ojas Gambheera reappears in Mumbai after a decade of exile to dismantle a ruthless international crime syndicate threatening his loyalists.',
    genres: ['Action', 'Crime'],
    languages: ['Telugu', 'Hindi', 'Tamil', 'Malayalam'],
    formats: ['4K Dolby Atmos', '2D'],
    duration: '2h 45m',
    durationMinutes: 165,
    releaseDate: '2025-03-27',
    rating: 9.5,
    votes: '390.4K',
    censorRating: 'A',
    poster: '/posters/og.jpg',
    posterUrl: '/posters/og.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1600&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=ZfK4_36bW34',
    director: 'Sujeeth',
    musicDirector: 'Thaman S',
    cast: [
      { name: 'Pawan Kalyan', role: 'Ojas Gambheera (OG)', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop' },
      { name: 'Emraan Hashmi', role: 'Omi Bhau', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' },
      { name: 'Priyanka Mohan', role: 'Kalyani', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' }
    ],
    status: 'NOW_SHOWING',
    isFeatured: true,
    cities: ['guntur', 'vijayawada', 'tenali']
  }
];

// CANTEEN SNACK & BEVERAGE MENU (Pre-Order for Interval)
export const CANTEEN_MENU = [
  {
    id: 'snk-01',
    name: 'Jumbo Butter Popcorn Tub',
    category: 'Popcorn',
    price: 180,
    calories: '450 kcal',
    image: '🍿',
    description: 'Freshly popped golden corn tossed in melted salted Amul butter.'
  },
  {
    id: 'snk-02',
    name: 'Caramel Glazed Popcorn',
    category: 'Popcorn',
    price: 210,
    calories: '520 kcal',
    image: '🍯',
    description: 'Crisp mushroom popcorn kernels coated in rich Belgian caramel glaze.'
  },
  {
    id: 'snk-03',
    name: 'Crispy Andhra Samosa Trio (3 Pcs)',
    category: 'Hot Snacks',
    price: 120,
    calories: '380 kcal',
    image: '🥟',
    description: 'Flaky pastry stuffed with spiced onion and potato, served with mint chutney.'
  },
  {
    id: 'snk-04',
    name: 'Peri-Peri Loaded Cheese Nachos',
    category: 'Hot Snacks',
    price: 160,
    calories: '490 kcal',
    image: '🧀',
    description: 'Crispy corn tortilla chips topped with warm jalapeño cheese sauce & peri-peri spice.'
  },
  {
    id: 'snk-05',
    name: 'Chilled Thums Up / Coca-Cola (650ml)',
    category: 'Beverages',
    price: 90,
    calories: '180 kcal',
    image: '🥤',
    description: 'Ice-cold fountain soda poured in a souvenir cinema cup.'
  },
  {
    id: 'snk-06',
    name: 'VIP Platinum Interval Combo',
    category: 'Combos',
    price: 340,
    calories: '890 kcal',
    image: '👑',
    description: 'Jumbo Butter Popcorn + 2 Samosas + 650ml Fountain Drink + Choco Truffle.'
  }
];

// LIVE CANTEEN FULFILLMENT ORDERS (For Theatre Manager Interval Board)
export const INITIAL_CANTEEN_ORDERS = [
  {
    id: 'ORD-8921',
    seat: 'A5',
    tier: 'BALCONY',
    customerName: 'Kishore V.',
    phone: '+91 98480 23419',
    items: [
      { name: 'Jumbo Butter Popcorn', qty: 1, price: 180 },
      { name: 'Chilled Thums Up (650ml)', qty: 2, price: 180 }
    ],
    total: 360,
    status: 'PREPARING', // PENDING, PREPARING, DELIVERED_TO_SEAT
    time: 'Interval: 12:15 PM'
  },
  {
    id: 'ORD-8922',
    seat: 'C12',
    tier: 'PREMIUM',
    customerName: 'Bhavani Shankar',
    phone: '+91 94401 88392',
    items: [
      { name: 'VIP Platinum Interval Combo', qty: 1, price: 340 },
      { name: 'Crispy Samosa Trio', qty: 1, price: 120 }
    ],
    total: 460,
    status: 'PENDING',
    time: 'Interval: 12:15 PM'
  },
  {
    id: 'ORD-8923',
    seat: 'F4',
    tier: 'EXECUTIVE',
    customerName: 'Suresh Babu',
    phone: '+91 98492 11029',
    items: [
      { name: 'Peri-Peri Cheese Nachos', qty: 2, price: 320 }
    ],
    total: 320,
    status: 'DELIVERED_TO_SEAT',
    time: 'Interval: 12:15 PM'
  },
  {
    id: 'ORD-8924',
    seat: 'B2',
    tier: 'BALCONY',
    customerName: 'Ananya Reddy',
    phone: '+91 99881 23450',
    items: [
      { name: 'Caramel Glazed Popcorn', qty: 1, price: 210 },
      { name: 'Cold Coffee Frappe', qty: 1, price: 130 }
    ],
    total: 340,
    status: 'PREPARING',
    time: 'Interval: 12:15 PM'
  }
];

// // USER-SPECIFIED THEATRE: SIVA CINEMAS ONLY
export const THEATRES = [
  {
    id: 'th-gtr-001',
    name: 'Siva Cinemas',
    slug: 'siva-cinemas-guntur',
    city: 'guntur',
    address: 'Near Old Bus Stand, Guntur',
    facilities: ['4K Laser Projection', 'Dolby Atmos', 'Plush Pushback Seats', 'Parking', 'Canteen'],
    distance: '1.2 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-gtr-01', name: 'Screen 1 4K Laser', sound: 'Dolby Atmos', totalSeats: 449 }
    ]
  }
];

export const EVENTS = [
  {
    id: 'eve-001',
    title: 'Telugu Comedy Fest — Live Standup Special',
    category: 'Standup Comedy',
    city: 'guntur',
    venue: 'Siva Cinemas Special Event Hall, Guntur',
    date: '2025-03-22',
    time: '19:00',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    priceStarting: 499,
    description: 'An evening of non-stop Telugu comedy, relatable middle-class humor, and hilarious storytelling.',
    isFeatured: true
  }
];

export const SAMPLE_SHOWTIMES = [
  {
    id: 'sh-gtr-01',
    movieId: 'mov-pushpa-2',
    theatreId: 'th-gtr-001',
    theatreName: 'Siva Cinemas',
    screenName: 'Screen 1 4K Laser',
    format: '4K Dolby Atmos',
    language: 'Telugu',
    time: '11:00 AM',
    slot: 'Morning Show',
    date: '2026-09-02',
    price: { BALCONY: 147, SECOND_CLASS: 84 },
    availability: 'AVAILABLE',
    fillingFast: false
  },
  {
    id: 'sh-gtr-02',
    movieId: 'mov-devara-1',
    theatreId: 'th-gtr-001',
    theatreName: 'Siva Cinemas',
    screenName: 'Screen 1 4K Laser',
    format: '4K Dolby Atmos',
    language: 'Telugu',
    time: '02:30 PM',
    slot: 'Matinee Show',
    date: '2026-09-02',
    price: { BALCONY: 147, SECOND_CLASS: 84 },
    availability: 'FILLING_FAST',
    fillingFast: true
  },
  {
    id: 'sh-gtr-03',
    movieId: 'mov-kalki-2898',
    theatreId: 'th-gtr-001',
    theatreName: 'Siva Cinemas',
    screenName: 'Screen 1 4K Laser',
    format: '4K Dolby Atmos',
    language: 'Telugu',
    time: '06:15 PM',
    slot: 'First Show',
    date: '2026-09-02',
    price: { BALCONY: 147, SECOND_CLASS: 84 },
    availability: 'ALMOST_FULL',
    fillingFast: true
  },
  {
    id: 'sh-gtr-04',
    movieId: 'mov-og-2025',
    theatreId: 'th-gtr-001',
    theatreName: 'Siva Cinemas',
    screenName: 'Screen 1 4K Laser',
    format: '4K Dolby Atmos',
    language: 'Telugu',
    time: '09:45 PM',
    slot: 'Second Show',
    date: '2026-09-02',
    price: { BALCONY: 147, SECOND_CLASS: 84 },
    availability: 'AVAILABLE',
    fillingFast: false
  }
];

// Exact Siva Cinemas 449-Seat Seating Layout Generator (BookMyShow Blueprint)
export const generateSeatLayout = (showId) => {
  const tiers = [];

  // ----------------------------------------------------
  // TIER 1: BALCONY CLASS (319 Seats, 14 Rows A to P)
  // ----------------------------------------------------
  const balconyRows = [];

  // Row A: Topmost row
  // Left: 1-6, Center: 7-15, Right: 16-23
  const rA_seats = [];
  for (let s = 1; s <= 6; s++) {
    rA_seats.push({ id: `A${s}`, number: s, row: 'A', rowLetter: 'A', tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: s === 6, is_aisle_after: s === 6 });
  }
  for (let s = 7; s <= 15; s++) {
    rA_seats.push({ id: `A${s}`, number: s, row: 'A', rowLetter: 'A', tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: s === 15, is_aisle_after: s === 15 });
  }
  for (let s = 16; s <= 23; s++) {
    rA_seats.push({ id: `A${s}`, number: s, row: 'A', rowLetter: 'A', tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: false, is_aisle_after: false });
  }
  balconyRows.push({ rowLetter: 'A', row_letter: 'A', seats: rA_seats });

  // Row B: Left (1-6), Center (8-14), Right (19-24)
  const rB_seats = [];
  for (let s = 1; s <= 6; s++) {
    rB_seats.push({ id: `B${s}`, number: s, row: 'B', rowLetter: 'B', tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: s === 6, is_aisle_after: s === 6 });
  }
  for (let s = 8; s <= 14; s++) {
    rB_seats.push({ id: `B${s}`, number: s, row: 'B', rowLetter: 'B', tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: s === 14, is_aisle_after: s === 14 });
  }
  for (let s = 19; s <= 24; s++) {
    rB_seats.push({ id: `B${s}`, number: s, row: 'B', rowLetter: 'B', tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: false, is_aisle_after: false });
  }
  balconyRows.push({ rowLetter: 'B', row_letter: 'B', seats: rB_seats });

  // Row C: Left (1-6), Right (19-24)
  const rC_seats = [];
  for (let s = 1; s <= 6; s++) {
    rC_seats.push({ id: `C${s}`, number: s, row: 'C', rowLetter: 'C', tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: s === 6, is_aisle_after: s === 6 });
  }
  for (let s = 19; s <= 24; s++) {
    rC_seats.push({ id: `C${s}`, number: s, row: 'C', rowLetter: 'C', tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: false, is_aisle_after: false });
  }
  balconyRows.push({ rowLetter: 'C', row_letter: 'C', seats: rC_seats });

  // Rows D, E, F: Left (1-6), Center (7-18), Right (19-24)
  ['D', 'E', 'F'].forEach((rLet) => {
    const r_seats = [];
    for (let s = 1; s <= 6; s++) {
      r_seats.push({ id: `${rLet}${s}`, number: s, row: rLet, rowLetter: rLet, tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: s === 6, is_aisle_after: s === 6 });
    }
    for (let s = 7; s <= 18; s++) {
      r_seats.push({ id: `${rLet}${s}`, number: s, row: rLet, rowLetter: rLet, tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: s === 18, is_aisle_after: s === 18 });
    }
    for (let s = 19; s <= 24; s++) {
      r_seats.push({ id: `${rLet}${s}`, number: s, row: rLet, rowLetter: rLet, tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: false, is_aisle_after: false });
    }
    balconyRows.push({ rowLetter: rLet, row_letter: rLet, seats: r_seats });
  });

  // Row G (bottom of upper balcony): Left (2-6), Center (7-18), Right (19-24)
  const rG_seats = [];
  for (let s = 2; s <= 6; s++) {
    rG_seats.push({ id: `G${s}`, number: s, row: 'G', rowLetter: 'G', tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: s === 6, is_aisle_after: s === 6 });
  }
  for (let s = 7; s <= 18; s++) {
    rG_seats.push({ id: `G${s}`, number: s, row: 'G', rowLetter: 'G', tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: s === 18, is_aisle_after: s === 18 });
  }
  for (let s = 19; s <= 24; s++) {
    rG_seats.push({ id: `G${s}`, number: s, row: 'G', rowLetter: 'G', tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: false, is_aisle_after: false });
  }
  balconyRows.push({ rowLetter: 'G', row_letter: 'G', seats: rG_seats });

  // Lower Balcony: Rows H, J, K, L, M
  ['H', 'J', 'K', 'L', 'M'].forEach((rLet) => {
    const r_seats = [];
    for (let s = 1; s <= 6; s++) {
      r_seats.push({ id: `${rLet}${s}`, number: s, row: rLet, rowLetter: rLet, tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: s === 6, is_aisle_after: s === 6 });
    }
    for (let s = 7; s <= 18; s++) {
      r_seats.push({ id: `${rLet}${s}`, number: s, row: rLet, rowLetter: rLet, tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: s === 18, is_aisle_after: s === 18 });
    }
    for (let s = 19; s <= 24; s++) {
      r_seats.push({ id: `${rLet}${s}`, number: s, row: rLet, rowLetter: rLet, tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: false, is_aisle_after: false });
    }
    balconyRows.push({ rowLetter: rLet, row_letter: rLet, seats: r_seats });
  });

  // Row N: Left (1-6), Center (6-18), Right (19-23)
  const rN_seats = [];
  for (let s = 1; s <= 6; s++) {
    rN_seats.push({ id: `N${s}`, number: s, row: 'N', rowLetter: 'N', tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: s === 6, is_aisle_after: s === 6 });
  }
  for (let s = 6; s <= 18; s++) {
    rN_seats.push({ id: `N${s}`, number: s, row: 'N', rowLetter: 'N', tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: s === 18, is_aisle_after: s === 18 });
  }
  for (let s = 19; s <= 23; s++) {
    rN_seats.push({ id: `N${s}`, number: s, row: 'N', rowLetter: 'N', tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: false, is_aisle_after: false });
  }
  balconyRows.push({ rowLetter: 'N', row_letter: 'N', seats: rN_seats });

  // Row P: Left (1-6), Center (5-19), Right (20-24)
  const rP_seats = [];
  for (let s = 1; s <= 6; s++) {
    rP_seats.push({ id: `P${s}`, number: s, row: 'P', rowLetter: 'P', tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: s === 6, is_aisle_after: s === 6 });
  }
  for (let s = 5; s <= 19; s++) {
    rP_seats.push({ id: `P${s}`, number: s, row: 'P', rowLetter: 'P', tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: s === 19, is_aisle_after: s === 19 });
  }
  for (let s = 20; s <= 24; s++) {
    rP_seats.push({ id: `P${s}`, number: s, row: 'P', rowLetter: 'P', tier: 'BALCONY', price: 1, status: 'AVAILABLE', isAisleAfter: false, is_aisle_after: false });
  }
  balconyRows.push({ rowLetter: 'P', row_letter: 'P', seats: rP_seats });

  tiers.push({
    id: 'BALCONY',
    name: 'BALCONY',
    tier: 'BALCONY',
    label: 'Balcony Class',
    price: 1,
    rows: balconyRows
  });

  // ----------------------------------------------------
  // TIER 2: SECOND CLASS (130 Seats, 5 Rows Q to U)
  // ----------------------------------------------------
  const secondClassRows = [];

  // Row Q: Long continuous walkway row (Seats 1 to 32)
  const rQ_seats = [];
  for (let s = 1; s <= 6; s++) {
    rQ_seats.push({ id: `Q${s}`, number: s, row: 'Q', rowLetter: 'Q', tier: 'SECOND_CLASS', price: 1, status: 'AVAILABLE', isAisleAfter: s === 6, is_aisle_after: s === 6 });
  }
  for (let s = 7; s <= 28; s++) {
    rQ_seats.push({ id: `Q${s}`, number: s, row: 'Q', rowLetter: 'Q', tier: 'SECOND_CLASS', price: 1, status: 'AVAILABLE', isAisleAfter: s === 28, is_aisle_after: s === 28 });
  }
  for (let s = 29; s <= 32; s++) {
    rQ_seats.push({ id: `Q${s}`, number: s, row: 'Q', rowLetter: 'Q', tier: 'SECOND_CLASS', price: 1, status: 'AVAILABLE', isAisleAfter: false, is_aisle_after: false });
  }
  secondClassRows.push({ rowLetter: 'Q', row_letter: 'Q', seats: rQ_seats });

  // Rows R, S, T: Left (1-6), Center (7-22), Right (23-28)
  ['R', 'S', 'T'].forEach((rLet) => {
    const r_seats = [];
    for (let s = 1; s <= 6; s++) {
      r_seats.push({ id: `${rLet}${s}`, number: s, row: rLet, rowLetter: rLet, tier: 'SECOND_CLASS', price: 1, status: 'AVAILABLE', isAisleAfter: s === 6, is_aisle_after: s === 6 });
    }
    for (let s = 7; s <= 22; s++) {
      r_seats.push({ id: `${rLet}${s}`, number: s, row: rLet, rowLetter: rLet, tier: 'SECOND_CLASS', price: 1, status: 'AVAILABLE', isAisleAfter: s === 22, is_aisle_after: s === 22 });
    }
    for (let s = 23; s <= 28; s++) {
      r_seats.push({ id: `${rLet}${s}`, number: s, row: rLet, rowLetter: rLet, tier: 'SECOND_CLASS', price: 1, status: 'AVAILABLE', isAisleAfter: false, is_aisle_after: false });
    }
    secondClassRows.push({ rowLetter: rLet, row_letter: rLet, seats: r_seats });
  });

  // Row U (front row near screen): Center (7-20)
  const rU_seats = [];
  for (let s = 7; s <= 20; s++) {
    rU_seats.push({ id: `U${s}`, number: s, row: 'U', rowLetter: 'U', tier: 'SECOND_CLASS', price: 1, status: 'AVAILABLE', isAisleAfter: false, is_aisle_after: false });
  }
  secondClassRows.push({ rowLetter: 'U', row_letter: 'U', seats: rU_seats });

  tiers.push({
    id: 'SECOND_CLASS',
    name: 'SECOND_CLASS',
    tier: 'SECOND_CLASS',
    label: 'Second Class',
    price: 1,
    rows: secondClassRows
  });

  return tiers;
};
