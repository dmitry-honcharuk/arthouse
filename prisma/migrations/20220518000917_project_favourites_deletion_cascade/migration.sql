-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_projectId_fkey";

-- AddForeignKey
ALTER TABLE "favorites"
    ADD CONSTRAINT "favorites_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
