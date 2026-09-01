// Rich catalog mock data for CineBook — Guntur (Default), Vijayawada & Tenali

export const CITIES = [
  { id: 'guntur', name: 'Guntur', state: 'Andhra Pradesh', icon: '🌶️', popular: true },
  { id: 'vijayawada', name: 'Vijayawada', state: 'Andhra Pradesh', icon: '🏛️', popular: true },
  { id: 'tenali', name: 'Tenali', state: 'Andhra Pradesh', icon: '🎭', popular: true }
];

export const GENRES = [
  'All', 'Action', 'Drama', 'Crime', 'Thriller', 'Comedy', 'Family'
];

export const LANGUAGES = [
  'All', 'Telugu', 'Hindi', 'Tamil', 'Malayalam', 'Kannada'
];

export const FORMATS = [
  'All', '2D', '3D', 'IMAX 3D', '4DX', 'Dolby Atmos'
];

// USER-REQUESTED 4 ALLU ARJUN BLOCKBUSTER MOVIES ONLY
export const MOVIES = [
  {
    id: 'mov-pushpa-2',
    title: 'Pushpa 2: The Rule (2024)',
    slug: 'pushpa-2-the-rule',
    tagline: 'The Rule Begins • Wildfire on Screen',
    description: 'Pushpa Raj expands his red sandalwood empire beyond borders, clashing in an intense battle of power and wits with SP Bhanwar Singh Shekhawat. A high-octane mass action thriller celebrating Indian cinema\'s biggest icon.',
    genres: ['Action', 'Crime', 'Drama', 'Thriller'],
    languages: ['Telugu', 'Hindi', 'Tamil', 'Malayalam', 'Kannada'],
    formats: ['IMAX 3D', '2D', '4DX', 'Dolby Atmos'],
    duration: '3h 20m',
    durationMinutes: 200,
    releaseDate: '2024-12-05',
    rating: 9.4,
    votes: '420.5K',
    censorRating: 'UA 16+',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=1kVK0MZlbI4',
    director: 'Sukumar',
    cast: [
      { name: 'Allu Arjun', role: 'Pushpa Raj', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop' },
      { name: 'Rashmika Mandanna', role: 'Srivalli', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' },
      { name: 'Fahadh Faasil', role: 'SP Bhanwar Singh Shekhawat', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' },
      { name: 'Jagapathi Babu', role: 'Prime Antagonist', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop' }
    ],
    status: 'NOW_SHOWING',
    isFeatured: true,
    cities: ['guntur', 'vijayawada', 'tenali']
  },
  {
    id: 'mov-pushpa-1',
    title: 'Pushpa: The Rise (2021)',
    slug: 'pushpa-the-rise',
    tagline: 'Thaggedhe Le! • The Journey to the Top',
    description: 'A laborer named Pushpa Raj rises through the ranks of a red sandalwood smuggling syndicate in the Seshachalam hills of Andhra Pradesh, defying every obstacle with sheer swagger and grit.',
    genres: ['Action', 'Crime', 'Drama'],
    languages: ['Telugu', 'Hindi', 'Tamil', 'Malayalam', 'Kannada'],
    formats: ['2D', 'Dolby Atmos'],
    duration: '2h 59m',
    durationMinutes: 179,
    releaseDate: '2021-12-17',
    rating: 9.0,
    votes: '350.2K',
    censorRating: 'UA',
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=pKctPN339Jg',
    director: 'Sukumar',
    cast: [
      { name: 'Allu Arjun', role: 'Pushpa Raj', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop' },
      { name: 'Rashmika Mandanna', role: 'Srivalli', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' },
      { name: 'Fahadh Faasil', role: 'SP Bhanwar Singh Shekhawat', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' },
      { name: 'Sunil', role: 'Mangalam Srinu', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop' }
    ],
    status: 'NOW_SHOWING',
    isFeatured: true,
    cities: ['guntur', 'vijayawada', 'tenali']
  },
  {
    id: 'mov-ala-vaikunthapurramuloo',
    title: 'Ala Vaikunthapurramuloo (2020)',
    slug: 'ala-vaikunthapurramuloo',
    tagline: 'Swag, Style & Family Entertainment',
    description: 'Bantu grows up facing constant neglect from his strict father Valmiki, only to discover a fateful secret about his true heritage as the biological heir of the affluent Vaikunthapuram estate.',
    genres: ['Action', 'Comedy', 'Family', 'Drama'],
    languages: ['Telugu', 'Malayalam', 'Hindi'],
    formats: ['2D', 'Dolby Atmos'],
    duration: '2h 45m',
    durationMinutes: 165,
    releaseDate: '2020-01-12',
    rating: 8.9,
    votes: '290.4K',
    censorRating: 'UA',
    posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1600&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=2K4Vb2p7k1M',
    director: 'Trivikram Srinivas',
    cast: [
      { name: 'Allu Arjun', role: 'Bantu', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop' },
      { name: 'Pooja Hegde', role: 'Amulya', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop' },
      { name: 'Tabu', role: 'Yasoda', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' },
      { name: 'Murali Sharma', role: 'Valmiki', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' }
    ],
    status: 'NOW_SHOWING',
    isFeatured: true,
    cities: ['guntur', 'vijayawada', 'tenali']
  },
  {
    id: 'mov-naa-peru-surya',
    title: 'Naa Peru Surya, Naa Illu India (2018)',
    slug: 'naa-peru-surya-naa-illu-india',
    tagline: 'A Soldier’s Battle for Nation & Self-Control',
    description: 'Surya, a patriotic Indian Army soldier with severe anger management issues, embarks on an emotional journey to get a signature of approval from the nation’s top psychologist to rejoin the military border.',
    genres: ['Action', 'Drama'],
    languages: ['Telugu', 'Malayalam', 'Hindi'],
    formats: ['2D', 'Dolby Atmos'],
    duration: '2h 48m',
    durationMinutes: 168,
    releaseDate: '2018-05-04',
    rating: 8.5,
    votes: '195.8K',
    censorRating: 'UA',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=ZfK4_36bW34',
    director: 'Vakkantham Vamsi',
    cast: [
      { name: 'Allu Arjun', role: 'Surya', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop' },
      { name: 'Anu Emmanuel', role: 'Varsha', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' },
      { name: 'Arjun Sarja', role: 'Prof. Ramakrishna Raju', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' },
      { name: 'R. Sarathkumar', role: 'Challa', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop' }
    ],
    status: 'NOW_SHOWING',
    isFeatured: true,
    cities: ['guntur', 'vijayawada', 'tenali']
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
      { id: 'scr-gtr-01', name: 'Screen 1 4K', sound: 'Dolby Atmos', totalSeats: 280 }
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
      { id: 'scr-vja-02', name: 'Yuvraj Screen 4K', sound: 'Dolby 7.1', totalSeats: 260 }
    ]
  },
  {
    id: 'th-vja-002',
    name: 'Ravi Cinemas',
    slug: 'ravi-cinemas-vijayawada',
    city: 'vijayawada',
    address: 'Beside Bus Station, Governorpet, Vijayawada',
    facilities: ['4K Digital Cinema', 'Dolby Surround', 'Pushback Seats'],
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
    facilities: ['4K Projection', 'Dolby Atmos', 'Balcony Loungers'],
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
    facilities: ['Qube 4K', 'Dolby 7.1', 'Parking'],
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
    facilities: ['Barco 4K Laser', 'Dolby Atmos 64-Channel', 'Pushback Seats'],
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
    facilities: ['4K Projection', 'Dolby Digital Surround', 'Air Conditioned'],
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
    facilities: ['Barco 4K Laser', 'Dolby Atmos 64-Channel', 'Plush Recliners'],
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
    facilities: ['Qube 4K Projection', 'Dolby 7.1', 'AC Balcony'],
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
    facilities: ['4K Digital Projection', 'Dolby Digital', 'Snack Bar'],
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
    facilities: ['Laser 4K 3D', 'Dolby Atmos', 'Luxury Pushback Seats'],
    distance: '1.0 km away',
    cancellationPolicy: 'Refundable up to 2 hours before showtime',
    screens: [
      { id: 'scr-tnl-07', name: 'V-Max Screen', sound: 'Dolby Atmos', totalSeats: 300 }
    ]
  }
];

export const SAMPLE_SHOWTIMES = [
  // --- PUSHPA 2: THE RULE (2024) SHOWTIMES ---
  {
    id: 'sh-gtr-01',
    movieId: 'mov-pushpa-2',
    theatreId: 'th-gtr-001',
    theatreName: 'Siva Cinemas',
    screenName: 'Screen 1 4K',
    format: '2D Dolby Atmos',
    language: 'Telugu',
    time: '11:00 AM',
    date: '2026-09-02',
    price: { RECLINER: 280, PREMIUM: 200, CLASSIC: 130 },
    availability: 'AVAILABLE',
    fillingFast: false
  },
  {
    id: 'sh-gtr-02',
    movieId: 'mov-pushpa-2',
    theatreId: 'th-gtr-001',
    theatreName: 'Siva Cinemas',
    screenName: 'Screen 1 4K',
    format: '2D Dolby Atmos',
    language: 'Telugu',
    time: '02:30 PM',
    date: '2026-09-02',
    price: { RECLINER: 280, PREMIUM: 200, CLASSIC: 130 },
    availability: 'FILLING_FAST',
    fillingFast: true
  },
  {
    id: 'sh-gtr-03',
    movieId: 'mov-pushpa-2',
    theatreId: 'th-gtr-005',
    theatreName: 'Naz / Hollywood Theater Complex',
    screenName: 'Hollywood Screen',
    format: 'IMAX 3D',
    language: 'Telugu',
    time: '06:15 PM',
    date: '2026-09-02',
    price: { RECLINER: 350, PREMIUM: 250, CLASSIC: 150 },
    availability: 'ALMOST_FULL',
    fillingFast: true
  },
  {
    id: 'sh-gtr-04',
    movieId: 'mov-pushpa-1',
    theatreId: 'th-gtr-002',
    theatreName: 'Studio 81 Cinemas',
    screenName: 'Audi 1',
    format: '2D Dolby Atmos',
    language: 'Telugu',
    time: '11:30 AM',
    date: '2026-09-02',
    price: { RECLINER: 250, PREMIUM: 180, CLASSIC: 120 },
    availability: 'AVAILABLE',
    fillingFast: false
  },
  {
    id: 'sh-gtr-05',
    movieId: 'mov-ala-vaikunthapurramuloo',
    theatreId: 'th-gtr-004',
    theatreName: 'GS Cinemas',
    screenName: 'Audi 1 (Dolby)',
    format: '2D Dolby Atmos',
    language: 'Telugu',
    time: '02:15 PM',
    date: '2026-09-02',
    price: { RECLINER: 250, PREMIUM: 180, CLASSIC: 120 },
    availability: 'AVAILABLE',
    fillingFast: false
  },
  {
    id: 'sh-gtr-06',
    movieId: 'mov-naa-peru-surya',
    theatreId: 'th-gtr-006',
    theatreName: 'Saraswathi Theatre',
    screenName: 'Main Hall',
    format: '2D',
    language: 'Telugu',
    time: '06:45 PM',
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
    format: '2D Dolby Atmos',
    language: 'Telugu',
    time: '11:15 AM',
    date: '2026-09-02',
    price: { RECLINER: 300, PREMIUM: 220, CLASSIC: 150 },
    availability: 'AVAILABLE',
    fillingFast: false
  },
  {
    id: 'sh-vja-02',
    movieId: 'mov-pushpa-2',
    theatreId: 'th-vja-005',
    theatreName: 'Alankar Theatre',
    screenName: 'Alankar 4K',
    format: '2D Dolby Atmos',
    language: 'Telugu',
    time: '02:15 PM',
    date: '2026-09-02',
    price: { RECLINER: 300, PREMIUM: 220, CLASSIC: 150 },
    availability: 'FILLING_FAST',
    fillingFast: true
  },
  {
    id: 'sh-vja-03',
    movieId: 'mov-pushpa-2',
    theatreId: 'th-vja-007',
    theatreName: 'Sailaja Theatre',
    screenName: 'Main Screen 4K',
    format: '2D Dolby Atmos',
    language: 'Telugu',
    time: '06:30 PM',
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
    format: '2D Dolby Atmos',
    language: 'Telugu',
    time: '11:15 AM',
    date: '2026-09-02',
    price: { RECLINER: 250, PREMIUM: 180, CLASSIC: 120 },
    availability: 'AVAILABLE',
    fillingFast: false
  },
  {
    id: 'sh-tnl-02',
    movieId: 'mov-pushpa-2',
    theatreId: 'th-tnl-004',
    theatreName: 'SV Cinemas (Priya Complex)',
    screenName: 'Priya Screen 1',
    format: '2D Dolby Atmos',
    language: 'Telugu',
    time: '02:45 PM',
    date: '2026-09-02',
    price: { RECLINER: 250, PREMIUM: 180, CLASSIC: 120 },
    availability: 'FILLING_FAST',
    fillingFast: true
  },
  {
    id: 'sh-tnl-03',
    movieId: 'mov-pushpa-2',
    theatreId: 'th-tnl-007',
    theatreName: 'V-Max Theatre',
    screenName: 'V-Max Screen',
    format: '2D Dolby Atmos',
    language: 'Telugu',
    time: '07:00 PM',
    date: '2026-09-02',
    price: { RECLINER: 260, PREMIUM: 190, CLASSIC: 130 },
    availability: 'ALMOST_FULL',
    fillingFast: true
  }
];

// Seat layout generator helper
export const generateSeatLayout = (showId) => {
  const tiers = [
    { name: 'RECLINER', label: 'Balcony / Recliner', price: 280, rows: ['A', 'B'] },
    { name: 'PREMIUM', label: 'Premium Executive', price: 190, rows: ['C', 'D', 'E', 'F'] },
    { name: 'CLASSIC', label: 'Classic First Class', price: 130, rows: ['G', 'H', 'J', 'K'] },
  ];

  const seatsPerRow = 14;
  const layout = [];

  tiers.forEach(tier => {
    const tierRows = [];
    tier.rows.forEach(rowLetter => {
      const seats = [];
      for (let i = 1; i <= seatsPerRow; i++) {
        const seatId = `${rowLetter}${i}`;
        const isBooked = (rowLetter === 'D' && (i === 5 || i === 6 || i === 7 || i === 8)) ||
                         (rowLetter === 'C' && (i === 6 || i === 7)) ||
                         (rowLetter === 'A' && (i === 1 || i === 2)) ||
                         (rowLetter === 'H' && (i === 11 || i === 12 || i === 13));
        
        const isLocked = (rowLetter === 'E' && (i === 7 || i === 8));

        seats.push({
          id: seatId,
          number: i,
          row: rowLetter,
          tier: tier.name,
          price: tier.price,
          status: isBooked ? 'BOOKED' : isLocked ? 'LOCKED' : 'AVAILABLE',
          isAisleAfter: i === 3 || i === 11
        });
      }
      tierRows.push({ rowLetter, seats });
    });
    layout.push({ ...tier, rows: tierRows });
  });

  return layout;
};
