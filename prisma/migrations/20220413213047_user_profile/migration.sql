-- CreateTable
CREATE TABLE "profile"
(
    "id"          UUID NOT NULL,
    "user_id"     UUID NOT NULL,
    "summary"     TEXT,
    "socialLinks" TEXT[],

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_user_id_key" ON "profile" ("user_id");

-- AddForeignKey
ALTER TABLE "profile"
    ADD CONSTRAINT "profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
