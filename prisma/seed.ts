import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORY_SEEDS = [
  {
    id: 'cat-celebration',
    name: 'Celebration',
    slug: 'celebration',
    description: 'Luxury celebration cakes for weddings, anniversaries, and special events.',
    color: '#c5a880',
    icon: 'sparkles',
    sortOrder: 1,
  },
  {
    id: 'cat-birthday',
    name: 'Birthday',
    slug: 'birthday',
    description: 'Birthday cakes for kids and adults.',
    color: '#d4a373',
    icon: 'party-popper',
    sortOrder: 2,
  },
  {
    id: 'cat-kids',
    name: 'Kids',
    slug: 'kids',
    description: 'Fun and colorful cakes for children.',
    color: '#8ecae6',
    icon: 'baby',
    sortOrder: 3,
  },
  {
    id: 'cat-treats',
    name: 'Treats',
    slug: 'treats',
    description: 'Macarons, platters, and sweet add-ons.',
    color: '#b08968',
    icon: 'cookie',
    sortOrder: 4,
  },
];

const sampleRequests = [
  {
    id: 'FB-9812A',
    contactName: 'Saba Tekle',
    contactPhone: '+251 911 123 456',
    eventType: 'Anniversary',
    guestCount: 85,
    deliveryOption: 'pickup',
    deliveryAddress: '',
    deliveryDate: new Date(Date.now() + 86400000 * 45).toISOString().split('T')[0],
    designStyle: 'Three-tier custom cream cake decorated with fresh golden-trimmed roses.',
    flavor: 'Madagascar Vanilla Bean',
    tierCount: 3,
    specialInstructions: 'Safe wrapping for travel. Pickup will occur at pre-scheduled slot.',
    requestDate: 'June 18, 2026',
    status: 'Designing',
    quotedPrice: 11500,
  },
  {
    id: 'FB-9231B',
    contactName: 'Kidus Solomon',
    contactPhone: '+251 912 345 678',
    eventType: 'Birthday',
    guestCount: 25,
    deliveryOption: 'pickup',
    deliveryAddress: '',
    deliveryDate: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0],
    designStyle: 'Clean modern custom iced birthday layout with golden edges.',
    flavor: 'Rich Chocolate Ganache',
    tierCount: 1,
    specialInstructions: 'Minimalist chocolate wording directly on cake surface.',
    requestDate: 'June 19, 2026',
    status: 'Quoted',
    quotedPrice: 2800,
  },
  {
    id: 'FB-8831C',
    contactName: 'Almaz Belay',
    contactPhone: '+251 922 987 654',
    eventType: 'Wedding',
    guestCount: 150,
    deliveryOption: 'delivery',
    deliveryAddress: 'Bole, near Edna Mall, Addis Ababa',
    deliveryDate: new Date(Date.now() + 86400000 * 60).toISOString().split('T')[0],
    designStyle: 'Four-tier traditional Ethiopian wedding layout with cascaded sugar jasmine flowers.',
    flavor: 'Red Velvet with Cream Cheese',
    tierCount: 4,
    specialInstructions: 'Timely refrigerated delivery is highly critical.',
    requestDate: 'June 20, 2026',
    status: 'Confirmed',
    quotedPrice: 18500,
    finalPrice: 18500,
  }
];

const GALLERY_ITEMS = [
  {
    id: 'wc-01',
    name: 'The Victorian Dream',
    description: 'A beautiful four-tier celebration cake with delicate white sugar lace, gold leaf details, and a cascade of fresh roses.',
    categorySlug: 'celebration',
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
    categorySlug: 'celebration',
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
    categorySlug: 'birthday',
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
    categorySlug: 'birthday',
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
    categorySlug: 'kids',
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
    categorySlug: 'kids',
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
    categorySlug: 'treats',
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
    categorySlug: 'treats',
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
    categorySlug: 'celebration',
    flavors: ['Pistachio Praline', 'Lemon Curd & Meringue'],
    priceEstimate: '4,500 ETB',
    image: 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&q=80&w=800',
    servingCount: '35 - 45 guests',
    tags: ['Celebration', 'Crystals', 'Gold Leaf', 'Pistachio']
  }
];

async function main() {
  console.log('Seeding baseline sample custom cake requests and gallery items into Neon database...');
  
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  const categoryMap = new Map(CATEGORY_SEEDS.map((category) => [category.slug, category.id]));

  // A. Seed Categories
  for (const category of CATEGORY_SEEDS) {
    const record = await prisma.category.upsert({
      where: { id: category.id },
      update: category,
      create: category,
    });
    console.log(`Upserted category: ${record.id} (${record.name})`);
  }

  // B. Seed Requests
  for (const req of sampleRequests) {
    const record = await prisma.customCakeRequest.upsert({
      where: { id: req.id },
      update: req as any,
      create: req as any
    });
    console.log(`Upserted custom cake request: ${record.id} (${record.contactName})`);
  }

  // C. Seed Gallery Items
  for (const item of GALLERY_ITEMS) {
    const categoryId = categoryMap.get(item.categorySlug) || CATEGORY_SEEDS[0].id;
    const { categorySlug, ...rest } = item;
    const record = await prisma.cakeGalleryItem.upsert({
      where: { id: item.id },
      update: { ...rest, categoryId },
      create: { ...rest, categoryId }
    });
    console.log(`Upserted gallery item: ${record.id} (${record.name})`);
  }

  console.log('Database successfully seeded with requests and gallery items!');
}

main()
  .catch((e) => {
    console.error('Seeding failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
