/*
  Warnings:

  - Added the required column `teacherId` to the `Contestation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `Vacancy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contestation" ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "teacherId" INTEGER NOT NULL,
ADD COLUMN     "vacancyId" INTEGER;

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "responseDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Semester" ADD COLUMN     "analysisEndDate" TIMESTAMP(3),
ADD COLUMN     "analysisStartDate" TIMESTAMP(3),
ADD COLUMN     "closureDate" TIMESTAMP(3),
ADD COLUMN     "homologationDate" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "linkConfirmEndDate" TIMESTAMP(3),
ADD COLUMN     "linkConfirmStartDate" TIMESTAMP(3),
ADD COLUMN     "orientationStartDate" TIMESTAMP(3),
ADD COLUMN     "searchEndDate" TIMESTAMP(3),
ADD COLUMN     "searchStartDate" TIMESTAMP(3),
ADD COLUMN     "themeRegEndDate" TIMESTAMP(3),
ADD COLUMN     "themeRegStartDate" TIMESTAMP(3),
ADD COLUMN     "vacancyDefEndDate" TIMESTAMP(3),
ADD COLUMN     "vacancyDefStartDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Vacancy" ADD COLUMN     "contestDeadline" TIMESTAMP(3),
ADD COLUMN     "contestReason" TEXT,
ADD COLUMN     "isContested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "semesterId" INTEGER,
ADD COLUMN     "teacherId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "loginAt" TIMESTAMP(3),
    "logoutAt" TIMESTAMP(3),
    "sessionDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contestation" ADD CONSTRAINT "Contestation_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contestation" ADD CONSTRAINT "Contestation_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vacancy" ADD CONSTRAINT "Vacancy_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vacancy" ADD CONSTRAINT "Vacancy_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
