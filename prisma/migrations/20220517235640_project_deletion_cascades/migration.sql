-- DropForeignKey
ALTER TABLE "project_items" DROP CONSTRAINT "project_items_project_id_fkey";

-- DropForeignKey
ALTER TABLE "project_security" DROP CONSTRAINT "project_security_project_id_fkey";

-- AddForeignKey
ALTER TABLE "project_security"
    ADD CONSTRAINT "project_security_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_items"
    ADD CONSTRAINT "project_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
