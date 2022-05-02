-- CreateTable
CREATE TABLE "albums"
(
    "id"      UUID NOT NULL,
    "name"    TEXT NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AlbumToProject"
(
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AlbumToProject_AB_unique" ON "_AlbumToProject" ("A", "B");

-- CreateIndex
CREATE INDEX "_AlbumToProject_B_index" ON "_AlbumToProject" ("B");

-- AddForeignKey
ALTER TABLE "albums"
    ADD CONSTRAINT "albums_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlbumToProject"
    ADD CONSTRAINT "_AlbumToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "albums" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlbumToProject"
    ADD CONSTRAINT "_AlbumToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
