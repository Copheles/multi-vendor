/*
  Warnings:

  - You are about to drop the column `image` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `ProductVariantItem` table. All the data in the column will be lost.
  - Added the required column `name` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `ProductVariantItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "image",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariantItem" DROP COLUMN "image",
ADD COLUMN     "name" TEXT NOT NULL;
