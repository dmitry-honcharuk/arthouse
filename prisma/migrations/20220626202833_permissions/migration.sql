/*
  Warnings:

  - The values [BLOCK_PROJECT,BLOCK_USER] on the enum `Permission` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Permission_new" AS ENUM ('SUPER', 'PROJECTS_BLOCK', 'USERS_BLOCK', 'USERS_LIST');
ALTER TABLE "admins" ALTER COLUMN "permissions" TYPE "Permission_new"[] USING ("permissions"::text::"Permission_new"[]);
ALTER TABLE "roles" ALTER COLUMN "permissions" TYPE "Permission_new"[] USING ("permissions"::text::"Permission_new"[]);
ALTER TYPE "Permission" RENAME TO "Permission_old";
ALTER TYPE "Permission_new" RENAME TO "Permission";
DROP TYPE "Permission_old";
COMMIT;
