/*
  Warnings:

  - You are about to drop the column `motivoContestacao` on the `Contestation` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `Keyword` table. All the data in the column will be lost.
  - You are about to drop the column `dataConclusao` on the `Orientation` table. All the data in the column will be lost.
  - You are about to drop the column `dataInicio` on the `Orientation` table. All the data in the column will be lost.
  - You are about to drop the column `ano` on the `Semester` table. All the data in the column will be lost.
  - You are about to drop the column `periodo` on the `Semester` table. All the data in the column will be lost.
  - You are about to drop the column `linkLattes` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tipoUsuario` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `quantidade` on the `Vacancy` table. All the data in the column will be lost.
  - You are about to drop the `Solicitation` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Keyword` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contestationReason` to the `Contestation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Keyword` table without a default value. This is not possible if the table is not empty.
  - Added the required column `period` to the `Semester` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Semester` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeUser` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Vacancy` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Solicitation" DROP CONSTRAINT "Solicitation_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Solicitation" DROP CONSTRAINT "Solicitation_teacherId_fkey";

-- DropIndex
DROP INDEX "public"."Keyword_nome_key";

-- AlterTable
ALTER TABLE "Contestation" DROP COLUMN "motivoContestacao",
ADD COLUMN     "contestationReason" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Keyword" DROP COLUMN "nome",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Orientation" DROP COLUMN "dataConclusao",
DROP COLUMN "dataInicio",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Semester" DROP COLUMN "ano",
DROP COLUMN "periodo",
ADD COLUMN     "period" TEXT NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "linkLattes",
ADD COLUMN     "lattesLink" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "nome",
DROP COLUMN "tipoUsuario",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "typeUser" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Vacancy" DROP COLUMN "quantidade",
ADD COLUMN     "quantity" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."Solicitation";

-- CreateTable
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "sendDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "denialJustification" TEXT,
    "studentId" INTEGER NOT NULL,
    "teacherId" INTEGER,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_name_key" ON "Keyword"("name");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
