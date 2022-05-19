-- CreateTable
CREATE TABLE "tags"
(
    "id"        SERIAL NOT NULL,
    "name"      TEXT   NOT NULL,
    "projectId" UUID,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags" ("name");

-- AddForeignKey
ALTER TABLE "tags"
    ADD CONSTRAINT "tags_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
