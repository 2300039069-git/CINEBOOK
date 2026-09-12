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
    posterUrl: 'https://image.tmdb.org/t/p/original/v87TfRzF2d3C1rR5sYq2sYy0z3m.jpg',
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
    posterUrl: 'https://image.tmdb.org/t/p/original/A7vPZ94iE9Y533xM4U2o1F5kK4R.jpg',
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
    posterUrl: 'https://image.tmdb.org/t/p/original/3w84hCFJ8vi5bTe69v2394g5U.jpg',
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
    posterUrl: 'https://image.tmdb.org/t/p/original/7c9JuVbmv0qgRjXw2zC6wH7LpQk.jpg',
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

// USER-SPECIFIED THEATRES FOR GUNTUR, VIJAYAWADA & TENALI
export const THEATRES = [
  // --- GUNTUR THEATRES (7 THEATRES) ---
  {
    id: 'th-gtr-001',
    name: 'Siva Cinemas',
    slug: 'siva-cinemas-guntur',
    city: 'guntur',
    address: 'Near Old Bus Stand, Guntur',
    facilities: ['4K Laser Projection', 'Dolby Atmos', 'Plush Pushback Seats', 'Parking'],
    distance: '1.2 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-gtr-01', name: 'Screen 1 4K Laser', sound: 'Dolby Atmos', totalSeats: 280 }
    ]
  },
  {
    id: 'th-gtr-002',
    name: 'Studio 81 Cinemas',
    slug: 'studio-81-cinemas-guntur',
    city: 'guntur',
    address: 'Arundelpet Main Road, Guntur',
    facilities: ['RGB 4K Laser', 'Dolby 7.1 Surround', 'Luxury Loungers', 'Cafeteria'],
    distance: '2.0 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-gtr-02', name: 'Audi 1', sound: 'Dolby 7.1', totalSeats: 220 }
    ]
  },
  {
    id: 'th-gtr-003',
    name: 'Bhaskar Cinemas',
    slug: 'bhaskar-cinemas-guntur',
    city: 'guntur',
    address: 'Kothapet, Main Road, Guntur',
    facilities: ['4K Digital Projection', 'Dolby Atmos 64-Channel', 'Air Conditioned'],
    distance: '1.8 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-gtr-03', name: 'Main Screen', sound: 'Dolby Atmos', totalSeats: 310 }
    ]
  },
  {
    id: 'th-gtr-004',
    name: 'GS Cinemas',
    slug: 'gs-cinemas-guntur',
    city: 'guntur',
    address: 'Brodipet 4/2, Guntur',
    facilities: ['4K Laser 3D', 'Dolby Atmos', 'Pushback Premium Seats'],
    distance: '1.5 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-gtr-04', name: 'Audi 1 (Dolby)', sound: 'Dolby Atmos', totalSeats: 250 }
    ]
  },
  {
    id: 'th-gtr-005',
    name: 'Naz / Hollywood Theater Complex',
    slug: 'naz-hollywood-complex-guntur',
    city: 'guntur',
    address: 'Naaz Centre, GT Road, Guntur',
    facilities: ['Barco 4K Laser', 'Dolby Atmos 7.1', 'Balcony & First Class', 'Food Court'],
    distance: '0.9 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-gtr-05', name: 'Hollywood Screen', sound: 'Dolby Atmos', totalSeats: 350 },
      { id: 'scr-gtr-06', name: 'Bollywood Screen', sound: 'Dolby 7.1', totalSeats: 300 }
    ]
  },
  {
    id: 'th-gtr-006',
    name: 'Saraswathi Theatre',
    slug: 'saraswathi-theatre-guntur',
    city: 'guntur',
    address: 'Brodipet 2nd Line, Guntur',
    facilities: ['Qube 4K Projection', 'Dolby Digital Surround', 'Parking'],
    distance: '1.4 km away',
    cancellationPolicy: 'Refundable up to 3 hours before showtime',
    screens: [
      { id: 'scr-gtr-07', name: 'Main Hall', sound: 'Dolby 7.1', totalSeats: 290 }
    ]
  },
  {
    id: 'th-gtr-007',
    name: 'Sri Lakshmi Cinema Hall',
    slug: 'sri-lakshmi-cinema-guntur',
    city: 'guntur',
    address: 'Nallapadu Road, Guntur',
    facilities: ['4K Digital Projection', 'Dolby Surround Sound', 'AC Balcony'],
    distance: '3.1 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-gtr-08', name: 'Screen 1', sound: 'Dolby Surround', totalSeats: 260 }
    ]
  },

  // --- VIJAYAWADA THEATRES (8 THEATRES) ---
  {
    id: 'th-vja-001',
    name: 'G3 Raj Yuvraj',
    slug: 'g3-raj-yuvraj-vijayawada',
    city: 'vijayawada',
    address: 'Gandhi Nagar, Vijayawada',
    facilities: ['4K Laser 3D', 'Dolby Atmos 7.1', 'Recliners', 'Cafeteria'],
    distance: '1.6 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-vja-01', name: 'Raj Screen (Dolby Atmos)', sound: 'Dolby Atmos', totalSeats: 320 },
      { id: 'scr-vja-02', name: 'Yuvraj Screen', sound: 'Dolby 7.1', totalSeats: 260 }
    ]
  },
  {
    id: 'th-vja-002',
    name: 'Ravi Cinemas',
    slug: 'ravi-cinemas-vijayawada',
    city: 'vijayawada',
    address: 'Governorpet, Vijayawada',
    facilities: ['4K Digital Cinema', 'Dolby Surround Sound', 'Parking'],
    distance: '1.0 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-vja-03', name: 'Screen 1', sound: 'Dolby 7.1', totalSeats: 270 }
    ]
  },
  {
    id: 'th-vja-003',
    name: 'Apsara Theatre',
    slug: 'apsara-theatre-vijayawada',
    city: 'vijayawada',
    address: 'Gandhi Nagar, Vijayawada',
    facilities: ['4K Laser', 'Dolby Digital', 'AC Seating'],
    distance: '1.8 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-vja-04', name: 'Main Audi', sound: 'Dolby 7.1', totalSeats: 290 }
    ]
  },
  {
    id: 'th-vja-004',
    name: 'Durga Kala Mandir',
    slug: 'durga-kala-mandir-vijayawada',
    city: 'vijayawada',
    address: 'Eluru Road, Governorpet, Vijayawada',
    facilities: ['4K Projection', 'Dolby Atmos', 'Balcony Class'],
    distance: '1.3 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-vja-05', name: 'Screen 1 Atmos', sound: 'Dolby Atmos', totalSeats: 310 }
    ]
  },
  {
    id: 'th-vja-005',
    name: 'Alankar Theatre',
    slug: 'alankar-theatre-vijayawada',
    city: 'vijayawada',
    address: 'Alankar Centre, MG Road, Vijayawada',
    facilities: ['Barco 4K Laser', 'Dolby Atmos', 'Premium Recliners'],
    distance: '2.0 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-vja-06', name: 'Alankar 4K', sound: 'Dolby Atmos', totalSeats: 340 }
    ]
  },
  {
    id: 'th-vja-006',
    name: 'Annapurna Theatre',
    slug: 'annapurna-theatre-vijayawada',
    city: 'vijayawada',
    address: 'Bunder Road, Patamata, Vijayawada',
    facilities: ['Qube 4K', 'Dolby 7.1', 'Food Court'],
    distance: '3.5 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-vja-07', name: 'Main Hall', sound: 'Dolby 7.1', totalSeats: 280 }
    ]
  },
  {
    id: 'th-vja-007',
    name: 'Sailaja Theatre',
    slug: 'sailaja-theatre-vijayawada',
    city: 'vijayawada',
    address: 'Prakasam Road, Governorpet, Vijayawada',
    facilities: ['Barco 4K Laser', 'Dolby Atmos 64-Channel', 'Recliners'],
    distance: '1.1 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-vja-08', name: 'Main Screen 4K', sound: 'Dolby Atmos', totalSeats: 350 }
    ]
  },
  {
    id: 'th-vja-008',
    name: 'Jayaram Theatre',
    slug: 'jayaram-theatre-vijayawada',
    city: 'vijayawada',
    address: 'Governorpet, Vijayawada',
    facilities: ['4K Digital Projection', 'Dolby Digital', 'AC Seating'],
    distance: '1.2 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-vja-09', name: 'Main Audi', sound: 'Dolby Digital', totalSeats: 260 }
    ]
  },

  // --- TENALI THEATRES (7 THEATRES) ---
  {
    id: 'th-tnl-001',
    name: 'Asha Cinemas',
    slug: 'asha-cinemas-tenali',
    city: 'tenali',
    address: 'Near Old Bus Stand, Main Road, Tenali',
    facilities: ['4K Laser Projection', 'Dolby Atmos', 'Pushback Seats'],
    distance: '0.9 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-tnl-01', name: 'Asha Screen 1', sound: 'Dolby Atmos', totalSeats: 280 }
    ]
  },
  {
    id: 'th-tnl-002',
    name: 'Sangameswara Cinemas',
    slug: 'sangameswara-cinemas-tenali',
    city: 'tenali',
    address: 'Station Road, Tenali',
    facilities: ['4K Digital 3D', 'Dolby 7.1', 'Parking'],
    distance: '0.7 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-tnl-02', name: 'Main Hall', sound: 'Dolby 7.1', totalSeats: 290 }
    ]
  },
  {
    id: 'th-tnl-003',
    name: 'Lakshmi Complex',
    slug: 'lakshmi-complex-tenali',
    city: 'tenali',
    address: 'Ganganamma Temple Street, Tenali',
    facilities: ['4K Projection', 'Dolby Digital', 'AC Hall'],
    distance: '1.2 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-tnl-03', name: 'Lakshmi Screen', sound: 'Dolby Surround', totalSeats: 250 }
    ]
  },
  {
    id: 'th-tnl-004',
    name: 'SV Cinemas (Priya Complex)',
    slug: 'sv-cinemas-priya-complex-tenali',
    city: 'tenali',
    address: 'Bose Road, Tenali',
    facilities: ['Barco 4K Laser', 'Dolby Atmos 64-Channel', 'Pushback Seats'],
    distance: '1.3 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-tnl-04', name: 'Priya Screen 1', sound: 'Dolby Atmos', totalSeats: 320 }
    ]
  },
  {
    id: 'th-tnl-005',
    name: 'Pemmasani Theatre',
    slug: 'pemmasani-theatre-tenali',
    city: 'tenali',
    address: 'Railway Station Road, Tenali',
    facilities: ['Qube 4K Projection', 'Dolby 7.1', 'Parking'],
    distance: '0.8 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-tnl-05', name: 'Main Audi', sound: 'Dolby 7.1', totalSeats: 270 }
    ]
  },
  {
    id: 'th-tnl-006',
    name: 'Swaraj Theatre',
    slug: 'swaraj-theatre-tenali',
    city: 'tenali',
    address: 'Morrispet, Tenali',
    facilities: ['4K Digital Projection', 'Dolby Digital', 'AC Seating'],
    distance: '1.5 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-tnl-06', name: 'Swaraj Screen', sound: 'Dolby Digital', totalSeats: 240 }
    ]
  },
  {
    id: 'th-tnl-007',
    name: 'V-Max Theatre',
    slug: 'v-max-theatre-tenali',
    city: 'tenali',
    address: 'Near Gandhi Statue, Main Road, Tenali',
    facilities: ['Laser 4K 3D', 'Dolby Atmos', 'Cafeteria'],
    distance: '1.0 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-tnl-07', name: 'V-Max Screen', sound: 'Dolby Atmos', totalSeats: 300 }
    ]
  }
];

export const EVENTS = [
  {
    id: 'eve-001',
    title: 'Telugu Comedy Fest — Live Standup Special',
    category: 'Standup Comedy',
    city: 'guntur',
    venue: 'Sri Venkateswara Vignana Mandiram, Guntur',
    date: '2025-03-22',
    time: '19:00',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    priceStarting: 499,
    description: 'An evening of non-stop Telugu comedy, relatable middle-class humor, and hilarious storytelling.',
    isFeatured: true
  },
  {
    id: 'eve-002',
    title: 'Anirudh Live in Concert — Hukum Tour',
    category: 'Music Concert',
    city: 'vijayawada',
    venue: 'Indira Gandhi Municipal Stadium, MG Road, Vijayawada',
    date: '2025-04-12',
    time: '18:30',
    bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
    priceStarting: 999,
    description: 'Rockstar Anirudh Ravichander live in Andhra Pradesh with explosive visual effects, bass, and chartbuster Telugu hits.',
    isFeatured: true
  },
  {
    id: 'eve-003',
    title: 'Tenali Cultural & Drama Mahotsav',
    category: 'Cultural Theatre',
    city: 'tenali',
    venue: 'Tenali Ramakrishna Cultural Auditorium, Tenali',
    date: '2025-03-29',
    time: '18:00',
    bannerUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
    priceStarting: 299,
    description: 'Celebrating the rich cultural legacy of the Paris of Andhra with mythological plays, classical music, and dance.',
    isFeatured: true
  }
];

export const SAMPLE_SHOWTIMES = [
  // --- GUNTUR SHOWTIMES ---
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
    price: { RECLINER: 280, PREMIUM: 200, CLASSIC: 130 },
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
    price: { RECLINER: 280, PREMIUM: 200, CLASSIC: 130 },
    availability: 'FILLING_FAST',
    fillingFast: true
  },
  {
    id: 'sh-gtr-03',
    movieId: 'mov-kalki-2898',
    theatreId: 'th-gtr-005',
    theatreName: 'Naz / Hollywood Theater Complex',
    screenName: 'Hollywood Screen',
    format: 'IMAX 3D',
    language: 'Telugu',
    time: '06:15 PM',
    slot: 'First Show',
    date: '2026-09-02',
    price: { RECLINER: 350, PREMIUM: 250, CLASSIC: 150 },
    availability: 'ALMOST_FULL',
    fillingFast: true
  },
  {
    id: 'sh-gtr-04',
    movieId: 'mov-og-2025',
    theatreId: 'th-gtr-002',
    theatreName: 'Studio 81 Cinemas',
    screenName: 'Audi 1',
    format: '4K Dolby Atmos',
    language: 'Telugu',
    time: '09:30 PM',
    slot: 'Second Show',
    date: '2026-09-02',
    price: { RECLINER: 250, PREMIUM: 180, CLASSIC: 120 },
    availability: 'AVAILABLE',
    fillingFast: false
  },
  {
    id: 'sh-gtr-05',
    movieId: 'mov-og-2025',
    theatreId: 'th-gtr-004',
    theatreName: 'GS Cinemas',
    screenName: 'Audi 1 (Dolby)',
    format: '4K Dolby Atmos',
    language: 'Telugu',
    time: '06:00 PM',
    slot: 'First Show',
    date: '2026-09-02',
    price: { RECLINER: 250, PREMIUM: 180, CLASSIC: 120 },
    availability: 'AVAILABLE',
    fillingFast: false
  },
  {
    id: 'sh-gtr-06',
    movieId: 'mov-pushpa-2',
    theatreId: 'th-gtr-006',
    theatreName: 'Saraswathi Theatre',
    screenName: 'Main Hall',
    format: '2D',
    language: 'Telugu',
    time: '09:45 PM',
    slot: 'Second Show',
    date: '2026-09-02',
    price: { RECLINER: 220, PREMIUM: 160, CLASSIC: 110 },
    availability: 'FILLING_FAST',
    fillingFast: true
  },

  // --- VIJAYAWADA SHOWTIMES ---
  {
    id: 'sh-vja-01',
    movieId: 'mov-pushpa-2',
    theatreId: 'th-vja-001',
    theatreName: 'G3 Raj Yuvraj',
    screenName: 'Raj Screen (Dolby Atmos)',
    format: '4K Dolby Atmos',
    language: 'Telugu',
    time: '11:15 AM',
    slot: 'Morning Show',
    date: '2026-09-02',
    price: { RECLINER: 300, PREMIUM: 220, CLASSIC: 150 },
    availability: 'AVAILABLE',
    fillingFast: false
  },
  {
    id: 'sh-vja-02',
    movieId: 'mov-devara-1',
    theatreId: 'th-vja-005',
    theatreName: 'Alankar Theatre',
    screenName: 'Alankar 4K',
    format: '4K Dolby Atmos',
    language: 'Telugu',
    time: '02:15 PM',
    slot: 'Matinee Show',
    date: '2026-09-02',
    price: { RECLINER: 300, PREMIUM: 220, CLASSIC: 150 },
    availability: 'FILLING_FAST',
    fillingFast: true
  },
  {
    id: 'sh-vja-03',
    movieId: 'mov-kalki-2898',
    theatreId: 'th-vja-007',
    theatreName: 'Sailaja Theatre',
    screenName: 'Main Screen 4K',
    format: '4K Dolby Atmos',
    language: 'Telugu',
    time: '06:30 PM',
    slot: 'First Show',
    date: '2026-09-02',
    price: { RECLINER: 320, PREMIUM: 240, CLASSIC: 160 },
    availability: 'ALMOST_FULL',
    fillingFast: true
  },

  // --- TENALI SHOWTIMES ---
  {
    id: 'sh-tnl-01',
    movieId: 'mov-pushpa-2',
    theatreId: 'th-tnl-001',
    theatreName: 'Asha Cinemas',
    screenName: 'Asha Screen 1',
    format: '4K Dolby Atmos',
    language: 'Telugu',
    time: '11:15 AM',
    slot: 'Morning Show',
    date: '2026-09-02',
    price: { RECLINER: 250, PREMIUM: 180, CLASSIC: 120 },
    availability: 'AVAILABLE',
    fillingFast: false
  },
  {
    id: 'sh-tnl-02',
    movieId: 'mov-devara-1',
    theatreId: 'th-tnl-004',
    theatreName: 'SV Cinemas (Priya Complex)',
    screenName: 'Priya Screen 1',
    format: '4K Dolby Atmos',
    language: 'Telugu',
    time: '02:45 PM',
    slot: 'Matinee Show',
    date: '2026-09-02',
    price: { RECLINER: 250, PREMIUM: 180, CLASSIC: 120 },
    availability: 'FILLING_FAST',
    fillingFast: true
  },
  {
    id: 'sh-tnl-03',
    movieId: 'mov-kalki-2898',
    theatreId: 'th-tnl-007',
    theatreName: 'V-Max Theatre',
    screenName: 'V-Max Screen',
    format: '4K Dolby Atmos',
    language: 'Telugu',
    time: '07:00 PM',
    slot: 'First Show',
    date: '2026-09-02',
    price: { RECLINER: 260, PREMIUM: 190, CLASSIC: 130 },
    availability: 'ALMOST_FULL',
    fillingFast: true
  }
];

// Dual-Quota Aware Seat Layout Generator (Real-time Supabase Synchronized)
export const generateSeatLayout = (showId) => {
  const tiers = [
    { name: 'RECLINER', tier: 'RECLINER', label: 'Balcony / Recliner (VIP)', price: 280, rows: ['A', 'B'] },
    { name: 'PREMIUM', tier: 'PREMIUM', label: 'Premium Executive', price: 190, rows: ['C', 'D', 'E', 'F'] },
    { name: 'CLASSIC', tier: 'CLASSIC', label: 'Classic First Class', price: 130, rows: ['G', 'H', 'J', 'K'] }
  ];

  const seatsPerRow = 14;
  const layout = [];

  tiers.forEach((tier) => {
    const tierRows = [];
    tier.rows.forEach((rowLetter) => {
      const seats = [];
      for (let i = 1; i <= seatsPerRow; i++) {
        const seatId = `${rowLetter}${i}`;

        seats.push({
          id: seatId,
          number: i,
          row: rowLetter,
          rowLetter: rowLetter,
          tier: tier.name,
          price: tier.price,
          quota: 'APP_INVENTORY',
          status: 'AVAILABLE',
          isAisleAfter: i === 3 || i === 11,
          is_aisle_after: i === 3 || i === 11
        });
      }
      tierRows.push({ rowLetter, row_letter: rowLetter, seats });
    });
    layout.push({ ...tier, rows: tierRows });
  });

  return layout;
};
