import {
    CakeGalleryItem,
    Testimonial,
    FaqItem,
    IngredientSpotlight,
} from "./types";

export const GALLERY_ITEMS: CakeGalleryItem[] = [
  {
    id: 'wc-01',
    name: 'The Victorian Dream',
    description: 'A beautiful four-tier celebration cake with delicate white sugar lace, gold leaf details, and a cascade of fresh roses.',
    categoryId: 'cat-celebration',
    category: { id: 'cat-celebration', name: 'Celebration', slug: 'celebration', color: '#c5a880', icon: 'sparkles' },
    flavors: ['Strawberry & Cream', 'Madagascar Vanilla Bean'],
    priceEstimate: '11,500 ETB',
    image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&q=80&w=800',
    servingCount: '75 - 100 guests',
    tags: ['Celebration', 'Floral', 'Gold Leaf', 'Classic']
  },
  {
    id: 'wc-02',
    name: 'Modern Gold Edge',
    description: 'A clean, modern three-tier cake with textured gray buttercream frosting and elegant gold-painted edges.',
    categoryId: 'cat-celebration',
    category: { id: 'cat-celebration', name: 'Celebration', slug: 'celebration', color: '#c5a880', icon: 'sparkles' },
    flavors: ['Earl Grey Tea & Lavender', 'Rich Chocolate Ganache'],
    priceEstimate: '9,500 ETB',
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=800',
    servingCount: '50 - 70 guests',
    tags: ['Celebration', 'Modern', 'Gold Leaf', 'Tea Accent']
  },
  {
    id: 'bc-01',
    name: 'Chocolate and Fig',
    description: 'Rich dark chocolate cake filled with homemade salted caramel, covered in dark frosting, and decorated with dried figs and edible gold.',
    categoryId: 'cat-birthday',
    category: { id: 'cat-birthday', name: 'Birthday', slug: 'birthday', color: '#d4a373', icon: 'party-popper' },
    flavors: ['Salted Caramel Pecan', 'Double Dark Belgian Chocolate'],
    priceEstimate: '2,400 ETB',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800',
    servingCount: '15 - 20 guests',
    tags: ['Birthday', 'Chocolate', 'Fruity', 'Gold Leaf']
  },
  {
    id: 'bc-02',
    name: 'Golden Marble',
    description: 'A beautiful cake with gold and white watercolor textures, decorated with hand-shaped sugar sails.',
    categoryId: 'cat-birthday',
    category: { id: 'cat-birthday', name: 'Birthday', slug: 'birthday', color: '#d4a373', icon: 'party-popper' },
    flavors: ['Coconut & Passionfruit', 'Matcha Green Tea'],
    priceEstimate: '2,800 ETB',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=800',
    servingCount: '20 - 25 guests',
    tags: ['Birthday', 'Modern', 'Gold Leaf', 'Matcha']
  },
  {
    id: 'kc-01',
    name: 'The Forest Story Cake',
    description: 'A playful cake decorated with cute marzipan animals, mushrooms, and a rustic hand-painted tree bark texture.',
    categoryId: 'cat-kids',
    category: { id: 'cat-kids', name: 'Kids', slug: 'kids', color: '#8ecae6', icon: 'baby' },
    flavors: ['Vanilla Rainbow Cream', 'Milk Chocolate Fluff'],
    priceEstimate: '1,900 ETB',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=800',
    servingCount: '12 - 15 guests',
    tags: ['Kids', 'Playful', 'Vanilla', 'Chocolate']
  },
  {
    id: 'kc-02',
    name: 'Sweet Carousel',
    description: 'A beautiful fairytale-inspired carousel birthday cake in soft blue, pink, and gold details.',
    categoryId: 'cat-kids',
    category: { id: 'cat-kids', name: 'Kids', slug: 'kids', color: '#8ecae6', icon: 'baby' },
    flavors: ['Classic Strawberry Shortcake', 'Sweet Honey Butter'],
    priceEstimate: '3,200 ETB',
    image: 'https://images.unsplash.com/photo-1558961313-7f24be4c1945?auto=format&fit=crop&q=80&w=800',
    servingCount: '25 - 30 guests',
    tags: ['Kids', 'Fairytale', 'Gold Leaf', 'Birthday']
  },
  {
    id: 'tr-01',
    name: 'Gourmet Sweets Platter',
    description: 'A handmade selection of classic macarons, raspberry cream buns, and chocolate-layered cakes.',
    categoryId: 'cat-treats',
    category: { id: 'cat-treats', name: 'Treats', slug: 'treats', color: '#b08968', icon: 'cookie' },
    flavors: ['Pistachio', 'Coffee', 'Rose & Lychee'],
    priceEstimate: '850 ETB / dozen',
    image: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&q=80&w=800',
    servingCount: 'Assorted custom platters',
    tags: ['Gourmet Treats', 'Assorted', 'Pistachio', 'Macarons']
  },
  {
    id: 'tr-02',
    name: 'Macaron Pyramid',
    description: 'A stunning display tower with 45 gold-dusted macarons filled with white chocolate cream.',
    categoryId: 'cat-treats',
    category: { id: 'cat-treats', name: 'Treats', slug: 'treats', color: '#b08968', icon: 'cookie' },
    flavors: ['Raspberry & White Chocolate'],
    priceEstimate: '1,800 ETB',
    image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=800',
    servingCount: 'Serves up to 25 people',
    tags: ['Gourmet Treats', 'Macarons', 'Fruity', 'Gold Leaf']
  },
  {
    id: 'cc-01',
    name: 'The Emerald Jewel',
    description: 'A striking emerald-green cake combined with edible sugar crystals growing from a gold-painted center.',
    categoryId: 'cat-celebration',
    category: { id: 'cat-celebration', name: 'Celebration', slug: 'celebration', color: '#c5a880', icon: 'sparkles' },
    flavors: ['Pistachio Praline', 'Lemon Curd & Meringue'],
    priceEstimate: '4,500 ETB',
    image: 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&q=80&w=800',
    servingCount: '35 - 45 guests',
    tags: ['Celebration', 'Crystals', 'Gold Leaf', 'Pistachio']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-01',
    author: 'Saba Tekle',
    eventType: 'Anniversary',
    role: 'Host',
    content: 'Yodit created the most stunning three-tier cake for our 25th anniversary. The gold-trimmed roses were absolutely breathtaking. Every guest asked where we got it!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    date: '2026-03-15',
    featured: true
  },
  {
    id: 't-02',
    author: 'Kidus Solomon',
    eventType: 'Birthday',
    role: 'Host',
    content: 'Ordered a birthday cake for my wife and it exceeded every expectation. The Madagascar vanilla was divine and the presentation was museum-worthy.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    date: '2026-02-20',
    featured: true
  },
  {
    id: 't-03',
    author: 'Almaz Belay',
    eventType: 'Wedding',
    role: 'Host',
    content: 'Our wedding cake was the centerpiece of the reception. Four tiers of perfection with cascading sugar jasmine flowers. Yodit understood our vision perfectly.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
    date: '2026-01-10',
    featured: true
  },
  {
    id: 't-04',
    author: 'Bereket Hailu',
    eventType: 'Corporate',
    role: 'Host',
    content: 'We commissioned Flavour Bites for our company milestone celebration. The custom branding on the cake was flawless, and the red velvet was the best I have ever tasted.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    date: '2026-04-05'
  },
  {
    id: 't-05',
    author: 'Meron Tadesse',
    eventType: 'Birthday',
    role: 'Host',
    content: 'Yodit made a magical fairytale cake for my daughter\'s 7th birthday. The marzipan animals were so cute the kids could barely eat them! Thank you for making her day so special.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    date: '2026-05-12',
    featured: false
  }
];

export const INGREDIENT_SPOTLIGHTS: IngredientSpotlight[] = [
  {
    name: 'Ethiopian Highland Butter',
    origin: 'Arsi Highlands, Ethiopia',
    description: 'Cultured organic butter from grass-fed cows grazing at 2,500m elevation. Its rich golden color and nutty aroma are the foundation of our signature cake texture.',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Madagascar Bourbon Vanilla',
    origin: 'Antalaha, Madagascar',
    description: 'Hand-pollinated, sun-cured vanilla beans with intense floral and creamy notes. Each pod is aged for 12 months before we extract the pure essence.',
    image: 'https://images.unsplash.com/photo-1582819509235-7c2a5a7b85c2?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Ethiopian Coffee',
    origin: 'Yirgacheffe, Ethiopia',
    description: 'Single-origin organic coffee with bright citrus and floral notes, ground fresh and folded into our coffee-infused buttercreams and cake batters.',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Organic Valley Honey',
    origin: 'Tigray, Ethiopia',
    description: 'Pure white honey from Ethiopia\'s ancient church forests. Its delicate sweetness and floral undertones create the most ethereal honey buttercreams.',
    image: 'https://images.unsplash.com/photo-1620218692324-619c5b5f110c?auto=format&fit=crop&q=80&w=400'
  }
];

export const FAQS: FaqItem[] = [
  {
    id: 'faq-01',
    question: 'How far in advance should I place my order?',
    answer: 'We require a minimum of 48 hours notice for all custom cake orders. For complex multi-tiered cakes or wedding cakes, we recommend ordering at least 2-3 weeks in advance to ensure availability and adequate design consultation time.',
    category: 'booking'
  },
  {
    id: 'faq-02',
    question: 'What is your deposit and payment policy?',
    answer: 'A 50% deposit is required to confirm all custom cake orders. The remaining balance is due upon pickup or delivery. We accept payment via Telebirr, CB Birr, or bank transfer to our Commercial Bank of Ethiopia account.',
    category: 'payment'
  },
  {
    id: 'faq-03',
    question: 'Do you offer delivery within Addis Ababa?',
    answer: 'Yes, we offer refrigerated delivery within Addis Ababa for an additional fee of 850 ETB. We deliver to Bole, Kazanchis, Old Airport, CMC, Ayat, Summit, and most sub-cities. Contact us for areas outside our standard delivery zone.',
    category: 'delivery'
  },
  {
    id: 'faq-04',
    question: 'Can I cancel or modify my order?',
    answer: 'Orders can be modified up to 48 hours before the scheduled pickup/delivery date. Cancellations made more than 72 hours in advance receive a full refund of the deposit. Cancellations within 48 hours are non-refundable as we have already begun sourcing ingredients.',
    category: 'cancellation'
  },
  {
    id: 'faq-05',
    question: 'Do you accommodate dietary restrictions?',
    answer: 'Yes! We offer eggless, dairy-free, and gluten-free options for many of our cake flavors. Please let us know about any dietary requirements during the consultation process so we can adjust our recipes accordingly.',
    category: 'dietary'
  },
  {
    id: 'faq-06',
    question: 'Where are you located?',
    answer: 'Our home studio is located in Bole, Addis Ababa, near Bole International Airport. We operate by appointment only. Once your order is confirmed, we will share our exact location and pickup instructions.',
    category: 'studio'
  },
  {
    id: 'faq-07',
    question: 'How do I store my cake after pickup?',
    answer: 'Buttercream cakes should be refrigerated and removed 2 hours before serving. Fondant cakes can be stored at room temperature away from direct sunlight. We provide detailed care instructions with every pickup.',
    category: 'care'
  }
];
