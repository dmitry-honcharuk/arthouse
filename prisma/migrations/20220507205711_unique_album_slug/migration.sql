/*
  Warnings:

  - A unique constraint covering the columns `[user_id,slug]` on the table `albums` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "albums_user_id_slug_key" ON "albums"("user_id", "slug");
