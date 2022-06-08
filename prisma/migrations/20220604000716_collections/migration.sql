/*
  Warnings:

  - The primary key for the `favorites` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[projectId,userId]` on the table `favorites` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `favorites` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_pkey",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "collections" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CollectionToFavorite" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CollectionToFavorite_AB_unique" ON "_CollectionToFavorite"("A", "B");

-- CreateIndex
CREATE INDEX "_CollectionToFavorite_B_index" ON "_CollectionToFavorite"("B");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_projectId_userId_key" ON "favorites"("projectId", "userId");

-- AddForeignKey
ALTER TABLE "_CollectionToFavorite" ADD CONSTRAINT "_CollectionToFavorite_A_fkey" FOREIGN KEY ("A") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToFavorite" ADD CONSTRAINT "_CollectionToFavorite_B_fkey" FOREIGN KEY ("B") REFERENCES "favorites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
