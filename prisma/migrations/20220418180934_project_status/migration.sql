-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('Published', 'Draft');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT E'Draft';
