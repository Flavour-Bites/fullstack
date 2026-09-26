-- Rename the "Quoted" order status to "Priced" and the "quotedPrice" field to "price".
ALTER TYPE "OrderStatus" RENAME VALUE 'Quoted' TO 'Priced';
ALTER TABLE "CustomCakeRequest" RENAME COLUMN "quotedPrice" TO "price";