/*
  Warnings:

  - You are about to drop the column `password` on the `project_security` table. All the data in the column will be lost.
  - Added the required column `password_hash` to the `project_security` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_iv` to the `project_security` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "project_security" DROP COLUMN "password",
ADD COLUMN     "password_hash" TEXT NOT NULL,
ADD COLUMN     "password_iv" TEXT NOT NULL;
