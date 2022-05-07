-- AlterEnum
ALTER TYPE "ProjectStatus" ADD VALUE 'SECURED';

-- CreateTable
CREATE TABLE "project_security"
(
    "project_id" UUID NOT NULL,
    "password"   TEXT NOT NULL,

    CONSTRAINT "project_security_pkey" PRIMARY KEY ("project_id")
);

-- AddForeignKey
ALTER TABLE "project_security"
    ADD CONSTRAINT "project_security_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
