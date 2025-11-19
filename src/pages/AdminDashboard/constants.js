// Import country flags (you'll need to add these to your assets)
import usFlag from '../../assets/flags/us.png';
import ukFlag from '../../assets/flags/uk.png';
import euFlag from '../../assets/flags/eu.jpg';
import pkFlag from '../../assets/flags/pk.svg';
import aeFlag from '../../assets/flags/ae.png'; // UAE flag for Dirham
import saFlag from '../../assets/flags/sa.png'; // Saudi Arabia flag for Riyal
import auFlag from '../../assets/flags/au.png'; // Australia flag for AUD

export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: usFlag },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: ukFlag },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: euFlag },
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee', flag: pkFlag },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: aeFlag },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: saFlag },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: auFlag }
];

export const navItems = [
  "Sales & Marketing",
  "Virtual Professionals",
  "IT and Telecom",
  "Contact Centre",
  "Accounting & Finance",
  "Insurance",
  "Medical",
  "Dental"
];

export const niches = [
  { id: 1, name: 'Sales' },
  { id: 2, name: 'Marketing' },
  { id: 3, name: 'Virtual Professionals' },
  { id: 4, name: 'Call Center' },
  { id: 5, name: 'Tax & Accounting' },
  { id: 6, name: 'Insurance' },
  { id: 7, name: 'Medical' },
  { id: 8, name: 'Dental' },
  { id: 9, name: 'VA' }
];

export const companies = [
  { id: 1, name: 'Dinotec', niches: [] },
  { id: 2, name: '3Sip Services', niches: [] },
  { id: 3, name: 'Masterways', niches: [] },
  { id: 4, name: 'Akuls', niches: [] }
];