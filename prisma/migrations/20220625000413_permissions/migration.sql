-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('SUPER', 'BLOCK_PROJECT', 'BLOCK_USER');

-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "permissions" "Permission"[];

-- CreateTable
CREATE TABLE "roles" (
    "name" TEXT NOT NULL,
    "permissions" "Permission"[],

    CONSTRAINT "roles_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "_AdminToRole" (
    "A" UUID NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AdminToRole_AB_unique" ON "_AdminToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_AdminToRole_B_index" ON "_AdminToRole"("B");

-- AddForeignKey
ALTER TABLE "_AdminToRole" ADD CONSTRAINT "_AdminToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "admins"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToRole" ADD CONSTRAINT "_AdminToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "roles"("name") ON DELETE CASCADE ON UPDATE CASCADE;
