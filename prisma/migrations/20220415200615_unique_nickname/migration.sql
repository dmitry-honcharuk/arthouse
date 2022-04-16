/*
  Warnings:

  - A unique constraint covering the columns `[nickname]` on the table `profile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "profile_nickname_key" ON "profile" ("nickname");
