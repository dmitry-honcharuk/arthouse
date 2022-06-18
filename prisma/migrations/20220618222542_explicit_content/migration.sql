-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "explicit" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "show_explicit" BOOLEAN NOT NULL DEFAULT false;
