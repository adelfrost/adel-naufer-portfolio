// Client wall shown between Languages and Contact.
//
// Two kinds of entries:
//   1. CLIENTS_ROW_1 / CLIENTS_ROW_2 — brands we have a real logo asset for.
//      Each PNG is a white silhouette on transparent (processed from the brand
//      original) so the row reads cleanly on the dark section. To add one: drop
//      a white-on-transparent PNG into public/logos/clients/ and add a line.
//   2. CLIENT_NAMES_1 / CLIENT_NAMES_2 — the long tail of the 400+ roster shown
//      as typographic wordmarks (most are local firms with no public logo file;
//      promote any of them to a real logo just by adding it to a row above).

export const CLIENTS_ROW_1 = [
  { src: '/logos/clients/qatar-airways.png', alt: 'Qatar Airways' },
  { src: '/logos/clients/ezdan.png', alt: 'Ezdan Holding' },
  { src: '/logos/clients/sheraton.png', alt: 'Sheraton' },
  { src: '/logos/clients/audi.png', alt: 'Audi' },
  { src: '/logos/clients/al-meera.png', alt: 'Al Meera' },
  { src: '/logos/clients/intercontinental.png', alt: 'InterContinental Hotels & Resorts' },
  { src: '/logos/clients/giordano.png', alt: 'Giordano' },
  { src: '/logos/clients/cummins.png', alt: 'Cummins' },
  { src: '/logos/clients/qncc.png', alt: 'Qatar National Convention Centre' },
  { src: '/logos/clients/best-western.png', alt: 'Best Western' },
  { src: '/logos/clients/cool-planet.png', alt: 'Cool Planet' },
  { src: '/logos/clients/le-royal-meridien.png', alt: 'Le Royal Meridien' },
  { src: '/logos/clients/jaidah-group.png', alt: 'Jaidah Group' },
  { src: '/logos/clients/match-hospitality.png', alt: 'Match Hospitality' },
  { src: '/logos/clients/doha-golf-club.png', alt: 'Doha Golf Club' },
  { src: '/logos/clients/fraser-suites.png', alt: 'Fraser Suites' },
  { src: '/logos/clients/ucc-holding.png', alt: 'UCC Holding' },
  { src: '/logos/clients/apple.png', alt: 'Apple' },
  { src: '/logos/clients/jollibee.png', alt: 'Jollibee' },
  { src: '/logos/clients/under-armour.png', alt: 'Under Armour' },
  { src: '/logos/clients/agora-doha.png', alt: 'Agora Doha' },
  { src: '/logos/clients/four-rivers.png', alt: 'Four Rivers' },
  { src: '/logos/clients/manko.png', alt: 'Manko' },
  { src: '/logos/clients/alpha-advertising.png', alt: 'Alpha Advertising' },
];

export const CLIENTS_ROW_2 = [
  { src: '/logos/clients/fifa.png', alt: 'FIFA' },
  { src: '/logos/clients/al-fardan.png', alt: 'Al Fardan' },
  { src: '/logos/clients/ihg.png', alt: 'IHG Hotels & Resorts' },
  { src: '/logos/clients/eversendai.png', alt: 'Eversendai' },
  { src: '/logos/clients/qatar-rail.png', alt: 'Qatar Rail' },
  { src: '/logos/clients/delice-gourmet.png', alt: 'Delice Gourmet' },
  { src: '/logos/clients/alpina-group.png', alt: 'Alpina Group' },
  { src: '/logos/clients/lamar.png', alt: 'Lamar' },
  { src: '/logos/clients/elissar.png', alt: 'Elissar Mediterranean Grill' },
  { src: '/logos/clients/cit.png', alt: 'CIT' },
  { src: '/logos/clients/mall-global.png', alt: 'Mall Global' },
  { src: '/logos/clients/kuwait-business-council.png', alt: 'Kuwait Business Council' },
  { src: '/logos/clients/social-tech.png', alt: 'Social Tech' },
  { src: '/logos/clients/alsamak.png', alt: 'Alsamak Fish Market' },
  { src: '/logos/clients/novecento.png', alt: 'Novecento' },
  { src: '/logos/clients/sports-lounge.png', alt: 'Sports Lounge' },
  { src: '/logos/clients/menats.png', alt: 'Menats' },
  { src: '/logos/clients/advance-laundry.png', alt: 'Advance Laundry' },
  { src: '/logos/clients/body-bath-beauty.png', alt: 'Body Bath Beauty' },
  { src: '/logos/clients/alpina-kitchen.png', alt: 'Alpina Kitchen' },
  { src: '/logos/clients/alpina-real-estate.png', alt: 'Alpina Real Estate' },
  { src: '/logos/clients/alpina-trading.png', alt: 'Alpina Trading' },
  { src: '/logos/clients/lamar-beach.png', alt: 'Lamar Beach' },
];

// Long-tail roster (names without a public logo asset). Cleaned + de-duped
// against the logo rows above.
export const CLIENT_NAMES_1 = [
  'CGC', 'Chryso', 'Ciron Trading Commodore', 'Concord Hotel', 'Dana World',
  'Danube Building Materials', 'Darwish Trading', 'Deligant', 'Dema Stone',
  'Digitec', 'Doha Clinic', 'Doha Drug Store', 'Doha Liwa', 'Doha Marriott',
  'Doha Rock', 'Oasis Restaurant', 'Eishbrecher', 'Elan Media', 'Equinox',
  'ERF', 'Euro Trading', 'Evolution Travels', 'Expedite Qatar', 'Ezdan Mall',
  'FFC Family Food Center', 'GAC', 'General Thaqaful', 'Nourish Media',
  'Arrium', 'Al Ali Engineering', 'Al Baironi Trading', 'Al Futtaim',
  'Al Ibtekar', 'Al Khaleej Manpower', 'Al Khulafa', 'Al Muftah', 'Al Ryes',
  'Al Shamshi Holdings', 'Al Aqaria', 'Alternative Line', 'American Chamber',
  'Amlak', 'Anantara', 'Appeal Qatar', 'Arabian Food Company',
];

export const CLIENT_NAMES_2 = [
  'Ariane Tower', 'Asama', 'Ashkaf World Avenue', 'Aspire', 'Austin',
  'Avenues Qatar', 'Batteel', 'B-Sides', 'Blue Print', 'BMW Qatar',
  'Brand X', 'Breathe Group', 'BTC', 'Carriage', 'Caribou Cafe', 'Cashmeer',
  'Cease Fire', 'Nova Cinema', 'NSS New State Services', 'Pilatus',
  'Poullaides Construction', 'Prime Media', 'Private Team',
  'Progressive Marketing', 'Pure Gold', 'Q Auto', 'Qatar Identity', 'QCP',
  'QNIE', 'QSI', 'Quality Hyper Market', 'Quick Pack', 'Recharge Qatar',
  'Rectangle', 'Redrock', 'Regal Qmass', 'Rivoli', 'Safari', 'Salams',
  'Sharaf Retail', 'Sharaka Holdings', 'Sherborn School', 'Shooting Star',
];
