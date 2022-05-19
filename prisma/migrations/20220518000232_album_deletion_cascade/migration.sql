-- DropForeignKey
ALTER TABLE "album_security" DROP CONSTRAINT "album_security_album_id_fkey";

-- AddForeignKey
ALTER TABLE "album_security"
    ADD CONSTRAINT "album_security_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
