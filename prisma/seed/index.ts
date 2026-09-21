import { PrismaClient } from '@prisma/client';
import { CATEGORY_SEEDS } from './categories.js';
import { SAMPLE_REQUESTS } from './requests.js';
import { GALLERY_ITEMS } from './gallery.js';
import { SAMPLE_REVIEWS } from './reviews.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding baseline sample custom cake requests, gallery items, and reviews into Neon database...');

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
  for (const req of SAMPLE_REQUESTS) {
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

  // D. Seed Reviews (idempotent; leaves user-created reviews untouched)
  for (const review of SAMPLE_REVIEWS) {
    const record = await prisma.review.upsert({
      where: { id: review.id },
      update: review,
      create: review
    });
    console.log(`Upserted review: ${record.id} (${record.author})`);
  }

  console.log('Database successfully seeded with requests, gallery items, and reviews!');
}

main()
  .catch((e) => {
    console.error('Seeding failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
