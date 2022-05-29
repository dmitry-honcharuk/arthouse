-- AlterTable
ALTER TABLE "projects"
    ADD COLUMN "favorite_count" INTEGER NOT NULL DEFAULT 0;

UPDATE projects
SET favorite_count=subquery.total
FROM (SELECT "projectId", count(*) as total
      FROM favorites
      group by "projectId") AS subquery
WHERE projects.id = subquery."projectId";

-- CreateIndex
CREATE INDEX "projects_favorite_count_idx" ON "projects" ("favorite_count");
