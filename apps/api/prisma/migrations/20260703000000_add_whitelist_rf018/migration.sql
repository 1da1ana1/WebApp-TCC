-- CreateEnum
CREATE TYPE "WhitelistRole" AS ENUM ('STUDENT', 'TEACHER');

-- CreateTable
CREATE TABLE "Whitelist" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "role" "WhitelistRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Whitelist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Whitelist_email_key" ON "Whitelist"("email");
