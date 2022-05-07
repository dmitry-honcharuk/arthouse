-- AlterTable
ALTER TABLE "project_security"
    ADD COLUMN "passwordVersion" INTEGER NOT NULL DEFAULT 1;
