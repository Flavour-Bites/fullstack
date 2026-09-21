export const BUSINESS_INFO = {
  name: 'Flavour Bites',
  tagline: 'Bespoke Artisanal Cake Boutique',
  chef: 'Chef Yodit Ashenafi',
  email: 'hello@flavourbites.et',
  phone: '+251 911 234567',
  phoneFormatted: '+251 911 234 567',
  hours: {
    pickup: 'Tue - Sun: 9:00 AM - 6:00 PM',
    consultations: 'Mon - Sat: 10:00 AM - 5:00 PM',
    closed: 'Mondays (Studio Prep)',
    pickupAm: 'ማክሰኞ — እሑድ፣ ከጠዋቱ 3:00 — ምሽቱ 12:00',
  },
  location: {
    name: 'Garment Studio',
    nameAm: 'የጋርመንት ስቱዲዮ',
    area: 'Garment',
    areaAm: 'ጋርመንት',
    subCity: 'Nifas Silk-Lafto',
    subCityAm: 'ንፋስ ስልክ-ላፍቶ',
    city: 'Addis Ababa',
    cityAm: 'አዲስ አበባ',
    country: 'Ethiopia',
    countryAm: 'ኢትዮጵያ',
    fullAddress: 'Garment, Nifas Silk-Lafto, Addis Ababa, Ethiopia',
    fullAddressAm: 'ጋርመንት፣ ንፋስ ስልክ-ላፍቶ፣ አዲስ አበባ፣ ኢትዮጵያ',
    coordinates: {
      lat: 8.9400641,
      lng: 38.7326197,
      display: '8.9401° N, 38.7326° E',
    },
    googleMapsUrl: 'https://maps.app.goo.gl/k96Y4XoeXMo1m7ZN9',
    googleMapsEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15764.73!2d38.7219773!3d8.9399709!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b83007cbf9f7d%3A0x42393c8b940a4b89!2sGarment!5e0!3m2!1sen!2set!4v1710000000000!5m2!1sen!2set',
    directionsNote:
      'Conveniently accessible along the Ring Road & Haile Garment corridor in Nifas Silk-Lafto. We operate by appointment only for scheduled pickups and bespoke cake consultations.',
  },
  social: {
    telegram: {
      handle: '@flavourbites_placeholder',
      link: 'https://t.me/flavourbites_placeholder',
    },
    instagram: {
      handle: '@flavourbites',
      link: 'https://instagram.com/flavourbites',
    },
  },
} as const;
