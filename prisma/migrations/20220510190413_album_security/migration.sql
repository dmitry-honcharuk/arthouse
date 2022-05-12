-- CreateTable
CREATE TABLE "album_security"
(
    "album_id"        UUID    NOT NULL,
    "password_hash"   TEXT    NOT NULL,
    "password_iv"     TEXT    NOT NULL,
    "passwordVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "album_security_pkey" PRIMARY KEY ("album_id")
);

-- AddForeignKey
ALTER TABLE "album_security"
    ADD CONSTRAINT "album_security_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
