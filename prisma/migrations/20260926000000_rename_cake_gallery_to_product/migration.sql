-- Rename CakeGalleryItem table to Product
ALTER TABLE IF EXISTS "CakeGalleryItem" RENAME TO "Product";

-- Rename primary key constraint
ALTER TABLE IF EXISTS "Product" RENAME CONSTRAINT "CakeGalleryItem_pkey" TO "Product_pkey";

-- Rename foreign key constraint
ALTER TABLE IF EXISTS "Product" RENAME CONSTRAINT "CakeGalleryItem_categoryId_fkey" TO "Product_categoryId_fkey";

-- Re-point Review foreign key to Product with ON DELETE CASCADE
ALTER TABLE IF EXISTS "Review" DROP CONSTRAINT IF EXISTS "Review_productId_fkey";
ALTER TABLE IF EXISTS "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Rename index
ALTER INDEX IF EXISTS "CakeGalleryItem_isActive_idx" RENAME TO "Product_isActive_idx";
