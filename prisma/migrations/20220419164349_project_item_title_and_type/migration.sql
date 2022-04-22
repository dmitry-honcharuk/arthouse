/*
  Warnings:

  - Added the required column `title` to the `project_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `project_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `project_items` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectItemType" AS ENUM ('IMAGE', 'YOUTUBE');

-- AlterTable
ALTER TABLE "project_items"
    ADD COLUMN "title" TEXT              NOT NULL,
    ADD COLUMN "type"  "ProjectItemType" NOT NULL,
    ADD COLUMN "value" TEXT              NOT NULL;
